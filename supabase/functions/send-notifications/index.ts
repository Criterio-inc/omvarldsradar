// ============================================================
// OmvärldsRadar — Agentiskt flöde: E-postnotifieringar
// WAT: Workflow = notification-cycle, Agent = mailer, Tool = Resend
//
// Flöde:
//   1. Hämta alla pending-notifieringar från kön
//   2. Gruppera per användare
//   3. Skicka via Resend API
//   4. Uppdatera status (sent/failed)
//
// Triggas av:
//   - pg_cron (varje morgon kl 07:00)
//   - Manuellt via HTTP POST
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "OmvärldsRadar <noreply@criteroconsulting.se>";
const BATCH_SIZE = 10; // Max mail per körning (Resend Free: 100/dag)

interface Notification {
  id: string;
  profile_id: string;
  type: "briefing" | "alert" | "digest";
  subject: string;
  body: string;
  scheduled_for: string;
}

interface Profile {
  id: string;
  full_name: string;
  notification_preferences: {
    email_frequency: string;
    categories: string[];
    enabled: boolean;
  };
}

Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Steg 1: Hämta pending-notifieringar ---
    const now = new Date().toISOString();
    const { data: notifications, error: fetchError } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`);
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No pending notifications",
          duration_ms: Date.now() - startTime,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[Notifications] ${notifications.length} notifieringar att skicka`
    );

    // --- Steg 2: Hämta mottagarnas e-post ---
    const profileIds = [
      ...new Set(notifications.map((n: Notification) => n.profile_id)),
    ];
    const { data: users } = await supabase.auth.admin.listUsers();

    const emailMap = new Map<string, string>();
    for (const user of users?.users ?? []) {
      if (profileIds.includes(user.id) && user.email) {
        emailMap.set(user.id, user.email);
      }
    }

    // --- Steg 3: Skicka e-post ---
    let sent = 0;
    let failed = 0;

    for (const notification of notifications as Notification[]) {
      const email = emailMap.get(notification.profile_id);

      if (!email) {
        // Ingen e-post hittad — skippa
        await supabase
          .from("notification_queue")
          .update({
            status: "skipped",
            error_message: "No email found for profile",
          })
          .eq("id", notification.id);
        continue;
      }

      try {
        // Skicka via Resend
        const response = await fetch(RESEND_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [email],
            subject: notification.subject,
            html: wrapInTemplate(notification.subject, notification.body),
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Resend API error: ${response.status} ${errorBody}`);
        }

        // Markera som skickad
        await supabase
          .from("notification_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", notification.id);

        sent++;
        console.log(`[Notifications] ✓ Skickat till ${email}: ${notification.subject}`);
      } catch (error) {
        const errorMsg = (error as Error).message;

        await supabase
          .from("notification_queue")
          .update({
            status: "failed",
            error_message: errorMsg,
          })
          .eq("id", notification.id);

        failed++;
        console.error(`[Notifications] ✗ Misslyckades för ${email}: ${errorMsg}`);
      }

      // Rate limit: 200ms mellan mail
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const summary = {
      timestamp: now,
      total: notifications.length,
      sent,
      failed,
      skipped: notifications.length - sent - failed,
      duration_ms: Date.now() - startTime,
    };

    console.log(
      `[Notifications] Klart: ${sent} skickade, ${failed} misslyckade`
    );

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[Notifications] Fatal error:`, error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// --- HTML e-postmall ---
function wrapInTemplate(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
  <div style="border-bottom: 3px solid #1e6b8a; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 20px; margin: 0; color: #1e6b8a;">OmvärldsRadar</h1>
    <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">AI-driven omvärldsbevakning för offentlig sektor</p>
  </div>

  <h2 style="font-size: 18px; margin-bottom: 16px;">${subject}</h2>

  <div style="font-size: 14px; line-height: 1.6;">
    ${body}
  </div>

  <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #9ca3af;">
    <p>Detta mail skickades automatiskt av OmvärldsRadar.</p>
    <p>Hantera dina notifieringsinställningar på <a href="https://omvarldsradar.criteroconsulting.se/settings" style="color: #1e6b8a;">omvarldsradar.criteroconsulting.se/settings</a></p>
    <p style="margin-top: 8px;">Critero Consulting AB &middot; Curago AB</p>
  </div>
</body>
</html>`;
}

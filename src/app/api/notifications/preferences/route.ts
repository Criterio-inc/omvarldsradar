import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Auth client — verifierar vem användaren är
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route Handlers: kan misslyckas i vissa kontexter
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

// Service role client — för databasuppdateringar (kringgår RLS)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET — Hämta notifieringsinställningar för inloggad användare
export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Använd service role för pålitlig läsning
  const serviceClient = getServiceClient();
  if (!serviceClient)
    return NextResponse.json({ error: "Server config error" }, { status: 500 });

  const { data, error } = await serviceClient
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    preferences: data?.notification_preferences ?? {
      enabled: true,
      email_frequency: "weekly",
      categories: [],
      weekly_briefing: true,
      acute_alerts: true,
      trend_digest: false,
    },
  });
}

// PATCH — Uppdatera notifieringsinställningar
export async function PATCH(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { preferences } = body as {
    preferences: Record<string, unknown>;
  };

  if (!preferences) {
    return NextResponse.json(
      { error: "preferences krävs" },
      { status: 400 }
    );
  }

  // Använd service role för pålitlig uppdatering (kringgår RLS-problem)
  const serviceClient = getServiceClient();
  if (!serviceClient)
    return NextResponse.json({ error: "Server config error" }, { status: 500 });

  console.log("[Prefs PATCH] User:", user.id, "Saving:", JSON.stringify(preferences));

  const { error } = await serviceClient
    .from("profiles")
    .update({
      notification_preferences: preferences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("[Prefs PATCH] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

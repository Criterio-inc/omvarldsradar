import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
        setAll() {
          // Read-only in route handlers
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

// GET — Hämta notifieringsinställningar för inloggad användare
export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
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
  const { user, supabase } = await getAuthenticatedUser();
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

  console.log("[Prefs PATCH] User:", user.id, "Saving:", JSON.stringify(preferences));

  const { error, count } = await supabase
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

  console.log("[Prefs PATCH] Success, rows affected:", count);
  return NextResponse.json({ success: true });
}

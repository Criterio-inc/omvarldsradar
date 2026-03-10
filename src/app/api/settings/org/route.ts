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

// GET — Hämta organisationsdata för inloggad användares org
export async function GET() {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Hämta profil med org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ org: null });
  }

  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, type, settings")
    .eq("id", profile.org_id)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    org: {
      id: org.id,
      name: org.name ?? "",
      type: org.type ?? "kommun",
      size: org.settings?.size ?? "medel",
    },
  });
}

// PATCH — Uppdatera organisationsinfo
export async function PATCH(request: Request) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, type, size } = body as {
    name?: string;
    type?: string;
    size?: string;
  };

  // Hämta org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json(
      { error: "Ingen organisation kopplad" },
      { status: 400 }
    );
  }

  // Hämta nuvarande settings för att mergea
  const { data: currentOrg } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", profile.org_id)
    .single();

  const updatedSettings = {
    ...(currentOrg?.settings || {}),
    ...(size ? { size } : {}),
  };

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    settings: updatedSettings,
  };
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;

  const { error } = await supabase
    .from("organizations")
    .update(updateData)
    .eq("id", profile.org_id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

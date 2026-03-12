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
  return { user };
}

// Service role client — för pålitliga databasoperationer
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET — Hämta organisationsdata för inloggad användares org
export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = getServiceClient();
  if (!serviceClient)
    return NextResponse.json({ error: "Server config error" }, { status: 500 });

  // Hämta profil med org_id
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ org: null });
  }

  const { data: org, error } = await serviceClient
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
      type: org.type ?? "municipality",
      size: org.settings?.size ?? "medel",
    },
  });
}

// PATCH — Uppdatera organisationsinfo
export async function PATCH(request: Request) {
  const { user } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = getServiceClient();
  if (!serviceClient)
    return NextResponse.json({ error: "Server config error" }, { status: 500 });

  const body = await request.json();
  const { name, type, size } = body as {
    name?: string;
    type?: string;
    size?: string;
  };

  // Hämta org_id
  const { data: profile } = await serviceClient
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
  const { data: currentOrg } = await serviceClient
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

  const { error } = await serviceClient
    .from("organizations")
    .update(updateData)
    .eq("id", profile.org_id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

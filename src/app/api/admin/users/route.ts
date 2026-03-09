import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Admin Supabase client (service_role key — server only)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

// Verify that the requesting user is an admin
async function verifyAdmin() {
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
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

// GET — Lista alla användare
export async function GET() {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const client = getAdminClient();
  if (!client)
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ej konfigurerad" },
      { status: 500 }
    );

  const {
    data: { users },
    error,
  } = await client.auth.admin.listUsers();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Join with profiles for role & name
  const { data: profiles } = await client.from("profiles").select("*");
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const result = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    full_name: profileMap.get(u.id)?.full_name || "",
    role: profileMap.get(u.id)?.role || "user",
  }));

  return NextResponse.json({ users: result });
}

// POST — Bjud in användare (en eller flera)
export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const client = getAdminClient();
  if (!client)
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ej konfigurerad" },
      { status: 500 }
    );

  const body = await request.json();
  const { emails, role = "user" } = body as {
    emails: string[];
    role?: string;
  };

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json(
      { error: "Inga e-postadresser angivna" },
      { status: 400 }
    );
  }

  const results: {
    email: string;
    success: boolean;
    error?: string;
  }[] = [];

  for (const email of emails) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      results.push({
        email: trimmed,
        success: false,
        error: "Ogiltig e-postadress",
      });
      continue;
    }

    const { data, error } = await client.auth.admin.inviteUserByEmail(trimmed);

    if (error) {
      results.push({ email: trimmed, success: false, error: error.message });
    } else {
      // Set role in profile if not default
      if (data.user && role !== "user") {
        await client.from("profiles").update({ role }).eq("id", data.user.id);
      }
      results.push({ email: trimmed, success: true });
    }
  }

  return NextResponse.json({ results });
}

// PATCH — Uppdatera användarroll
export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const client = getAdminClient();
  if (!client)
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ej konfigurerad" },
      { status: 500 }
    );

  const body = await request.json();
  const { userId, role } = body as { userId: string; role: string };

  if (!userId || !role) {
    return NextResponse.json(
      { error: "userId och role krävs" },
      { status: 400 }
    );
  }

  const { error } = await client
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// DELETE — Ta bort användare
export async function DELETE(request: Request) {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const client = getAdminClient();
  if (!client)
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ej konfigurerad" },
      { status: 500 }
    );

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  if (!userId) {
    return NextResponse.json(
      { error: "Inget användar-ID angivet" },
      { status: 400 }
    );
  }

  // Prevent self-deletion
  if (userId === admin.id) {
    return NextResponse.json(
      { error: "Du kan inte ta bort dig själv" },
      { status: 400 }
    );
  }

  const { error } = await client.auth.admin.deleteUser(userId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

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

// Service role client — för pålitliga databasoperationer (kringgår RLS)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET — Hämta profil + org för inloggad användare
export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = getServiceClient();
  if (!serviceClient)
    return NextResponse.json({ error: "Server config error" }, { status: 500 });

  // Hämta profil via service role (kringgår eventuella RLS-problem)
  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("full_name, role, org_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  const role = profile?.role || "viewer";
  const name = profile?.full_name || user.email?.split("@")[0] || "";
  const initials = name
    ? name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email || "").slice(0, 2).toUpperCase();

  // Hämta org-namn
  let org = "";
  if (profile?.org_id) {
    const { data: orgData } = await serviceClient
      .from("organizations")
      .select("name")
      .eq("id", profile.org_id)
      .single();
    org = orgData?.name || "";
  }

  return NextResponse.json({
    name,
    initials,
    org,
    role,
    email: user.email || "",
  });
}

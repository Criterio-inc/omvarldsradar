import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const cookieStore = await cookies();
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Will be set on response instead
            }
          });
        },
      },
    }
  );

  let authError: string | null = null;

  // Method 1: PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      authError = `code_exchange: ${error.message}`;
    }
  }
  // Method 2: Token hash flow (older/alternative)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "magiclink" | "email",
      token_hash,
    });
    if (error) {
      authError = `verify_otp: ${error.message}`;
    }
  }
  // No auth params at all — just redirect to login silently
  else {
    const loginUrl = new URL("/login", origin);
    return NextResponse.redirect(loginUrl.toString());
  }

  if (!authError) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocal = process.env.NODE_ENV === "development";

    let redirectUrl: string;
    if (isLocal) {
      redirectUrl = `${origin}${next}`;
    } else if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`;
    } else {
      redirectUrl = `${origin}${next}`;
    }

    const response = NextResponse.redirect(redirectUrl);

    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }

    return response;
  }

  // Redirect with error details so we can debug
  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", authError);
  return NextResponse.redirect(errorUrl.toString());
}

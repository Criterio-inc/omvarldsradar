"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "code">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle old callback errors (from previous magic link attempts)
  useEffect(() => {
    const callbackError = searchParams.get("error");
    if (callbackError) {
      if (callbackError.includes("PKCE") || callbackError.includes("code_verifier") || callbackError.includes("code_exchange")) {
        setError("Länken fungerade inte. Ange din e-post nedan för att få en inloggningskod istället.");
      }
    }
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const isDevMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http");

  // --- Step 1: Send OTP code ---
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    if (isDevMode) {
      router.push("/");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    setIsLoading(false);
    if (error) {
      if (error.message.includes("rate_limit") || error.message.includes("too many")) {
        setError("Du har begärt för många koder. Vänta en stund och försök igen.");
      } else if (error.message.includes("Signups not allowed")) {
        setError("Denna e-postadress har inget konto. Kontakta din administratör.");
      } else {
        setError(error.message);
      }
    } else {
      setStep("code");
      setOtpCode(["", "", "", "", "", "", "", ""]);
      setResendCooldown(60);
      // Focus first input after render
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }

  // --- Step 2: Verify OTP code ---
  const handleVerifyCode = useCallback(async (code: string) => {
    if (code.length !== 8) return;
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setIsLoading(false);
    if (error) {
      if (error.message.includes("expired") || error.message.includes("invalid")) {
        setError("Koden är felaktig eller har gått ut. Försök igen eller begär en ny kod.");
      } else {
        setError(error.message);
      }
      // Clear code inputs
      setOtpCode(["", "", "", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      // Success — redirect to dashboard
      router.push("/");
      router.refresh();
    }
  }, [email, router]);

  // --- Resend code ---
  async function handleResend() {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    setIsLoading(false);
    if (error) {
      setError("Kunde inte skicka ny kod. Försök igen om en stund.");
    } else {
      setResendCooldown(60);
      setOtpCode(["", "", "", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }

  // --- OTP input handlers ---
  function handleOtpChange(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...otpCode];
    newCode[index] = digit;
    setOtpCode(newCode);

    // Auto-advance to next input
    if (digit && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    const fullCode = newCode.join("");
    if (fullCode.length === 8) {
      handleVerifyCode(fullCode);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      // Move back on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;

    const newCode = [...otpCode];
    for (let i = 0; i < 8; i++) {
      newCode[i] = pasted[i] || "";
    }
    setOtpCode(newCode);

    // Focus last filled input or verify
    if (pasted.length === 8) {
      handleVerifyCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo + titel */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Image
            src="/omvarldsradar-logo.png"
            alt="OmvärldsRadar"
            width={80}
            height={80}
            className="rounded-2xl shadow-md"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              OmvärldsRadar
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              AI-driven omvärldsbevakning för offentlig sektor
            </p>
          </div>
        </div>

        <Card>
          {step === "email" ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Logga in</CardTitle>
                <CardDescription>
                  Ange din e-postadress för att få en inloggningskod
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendCode} className="flex flex-col gap-4">
                  {error && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
                      {error}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      E-postadress
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="namn@kommun.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Skickar...
                      </span>
                    ) : (
                      "Skicka inloggningskod"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Ange kod</CardTitle>
                <CardDescription>
                  Vi skickade en 8-siffrig kod till{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {error && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
                      {error}
                    </div>
                  )}

                  {/* 6-digit OTP input */}
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={isLoading}
                        className="h-12 w-10 rounded-lg border-2 border-input bg-transparent text-center text-xl font-bold shadow-xs transition-colors focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 disabled:opacity-50"
                      />
                    ))}
                  </div>

                  {isLoading && (
                    <div className="flex justify-center">
                      <svg className="h-5 w-5 animate-spin text-[var(--brand)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}

                  {/* Resend + change email */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-sm text-[var(--brand)] hover:underline disabled:text-muted-foreground disabled:no-underline"
                    >
                      {resendCooldown > 0
                        ? `Skicka ny kod om ${resendCooldown}s`
                        : "Skicka ny kod"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setError(null);
                        setOtpCode(["", "", "", "", "", "", "", ""]);
                      }}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Byt e-postadress
                    </button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {isDevMode && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Demo-läge &rarr; Gå till dashboard
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Genom att logga in godkänner du våra{" "}
          <span className="underline cursor-pointer">användarvillkor</span> och{" "}
          <span className="underline cursor-pointer">integritetspolicy</span>.
        </p>
      </div>
    </div>
  );
}

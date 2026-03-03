"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radar } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const router = useRouter();

  const isDevMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    if (isDevMode) {
      // Dev mode: skip auth, go straight to dashboard
      router.push("/");
      return;
    }

    // Simulate sending magic link
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)]">
              <Radar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              OmvärldsRadar
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-driven omvärldsbevakning för offentlig sektor
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Logga in</CardTitle>
            <CardDescription>
              Ange din e-postadress för att få en inloggningslänk
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Inloggningslänk skickad!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Kontrollera din inkorg på{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setIsSent(false);
                    setEmail("");
                  }}
                >
                  Prova en annan e-postadress
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Skickar...
                    </span>
                  ) : (
                    "Logga in"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {isDevMode && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Demo-läge → Gå till dashboard
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

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Upload,
  UserPlus,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
}

const roleColors: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  user: "bg-slate-100 text-slate-700 border-slate-200",
};

function getInitials(name: string, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteResults, setInviteResults] = useState<InviteResult[]>([]);

  // CSV
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [importingCsv, setImportingCsv] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kunde inte hämta användare");
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunde inte hämta användare"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Invite single user
  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteResults([]);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [inviteEmail], role: inviteRole }),
      });
      const data = await res.json();
      setInviteResults(data.results || []);
      if (data.results?.[0]?.success) {
        setInviteEmail("");
        loadUsers();
      }
    } catch {
      setInviteResults([
        { email: inviteEmail, success: false, error: "Nätverksfel" },
      ]);
    } finally {
      setInviting(false);
    }
  }

  // CSV file handler
  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Extract all email addresses from the file
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const found = text.match(emailRegex) || [];
      // Deduplicate
      const unique = [...new Set(found.map((e) => e.toLowerCase()))];
      setCsvEmails(unique);
    };
    reader.readAsText(file);
  }

  // Import CSV emails
  async function handleCsvImport() {
    if (csvEmails.length === 0) return;
    setImportingCsv(true);
    setInviteResults([]);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: csvEmails, role: inviteRole }),
      });
      const data = await res.json();
      setInviteResults(data.results || []);
      const anySuccess = data.results?.some(
        (r: InviteResult) => r.success
      );
      if (anySuccess) {
        setCsvEmails([]);
        setCsvFileName("");
        loadUsers();
      }
    } catch {
      setInviteResults([
        { email: "(batch)", success: false, error: "Nätverksfel" },
      ]);
    } finally {
      setImportingCsv(false);
    }
  }

  // Delete user
  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Vill du verkligen ta bort ${email}?`)) return;
    setDeletingId(userId);

    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Kunde inte ta bort användare");
      } else {
        loadUsers();
      }
    } catch {
      alert("Nätverksfel");
    } finally {
      setDeletingId(null);
    }
  }

  // Update role
  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      // silently fail, user can retry
    }
  }

  // Remove a parsed CSV email before import
  function removeCsvEmail(email: string) {
    setCsvEmails((prev) => prev.filter((e) => e !== email));
  }

  if (error === "Unauthorized") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-semibold">Ingen behörighet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bara administratörer har tillgång till den här sidan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">
          Hantera användare och bjud in nya teammedlemmar
        </p>
      </div>

      {/* Invite section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Single invite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Bjud in användare
            </CardTitle>
            <CardDescription>
              Skicka en inbjudan via e-post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-3">
              <Input
                type="email"
                placeholder="namn@kommun.se"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <select
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="user">Användare</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  type="submit"
                  disabled={inviting || !inviteEmail}
                  className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
                >
                  {inviting ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-1.5 h-4 w-4" />
                  )}
                  Bjud in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* CSV import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" />
              Importera från fil
            </CardTitle>
            <CardDescription>
              Ladda upp en CSV/textfil med e-postadresser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-muted-foreground/30 px-4 py-2 text-sm transition-colors hover:bg-muted/50">
                <Upload className="h-4 w-4 text-muted-foreground" />
                {csvFileName || "Välj fil..."}
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleCsvFile}
                  className="hidden"
                />
              </label>
            </div>

            {csvEmails.length > 0 && (
              <>
                <div className="max-h-32 overflow-y-auto rounded-md border p-2">
                  <div className="flex flex-wrap gap-1.5">
                    {csvEmails.map((email) => (
                      <Badge
                        key={email}
                        variant="outline"
                        className="gap-1 pr-1"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeCsvEmail(email)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {csvEmails.length} e-postadresser hittade
                  </span>
                  <Button
                    onClick={handleCsvImport}
                    disabled={importingCsv}
                    className="bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90"
                  >
                    {importingCsv ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-1.5 h-4 w-4" />
                    )}
                    Importera alla
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite results */}
      {inviteResults.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              {inviteResults.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {r.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{r.email}</span>
                  {r.success ? (
                    <span className="text-green-600">— Inbjudan skickad</span>
                  ) : (
                    <span className="text-red-500">— {r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4" />
                Användare
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Laddar..."
                  : `${users.length} registrerade användare`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Inga användare hittade
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => (
                <div key={user.id}>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-[var(--brand)] text-xs text-white">
                        {getInitials(user.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {user.full_name || user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="h-8 rounded-md border border-input bg-transparent px-2 py-0.5 text-xs shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                      >
                        <option value="user">Användare</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Badge
                        variant="outline"
                        className={
                          roleColors[user.role] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }
                      >
                        {user.role === "admin" ? "Admin" : "Användare"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={deletingId === user.id}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      >
                        {deletingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 ml-14 flex gap-4 text-xs text-muted-foreground">
                    <span>
                      Skapad:{" "}
                      {new Date(user.created_at).toLocaleDateString("sv-SE")}
                    </span>
                    {user.last_sign_in_at && (
                      <span>
                        Senaste inloggning:{" "}
                        {new Date(user.last_sign_in_at).toLocaleDateString(
                          "sv-SE"
                        )}
                      </span>
                    )}
                  </div>
                  {index < users.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

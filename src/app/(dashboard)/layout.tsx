"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client"; // Används för logout
import {
  LayoutDashboard,
  Newspaper,
  Mail,
  TrendingUp,
  Search,
  Settings,
  Bell,
  Menu,
  LogOut,
  User,
  ChevronDown,
  Info,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { label: "Översikt", href: "/", icon: LayoutDashboard },
  { label: "Flödet", href: "/feed", icon: Newspaper },
  { label: "Briefing", href: "/briefing", icon: Mail },
  { label: "Trender", href: "/trends", icon: TrendingUp },
  { label: "Sök", href: "/search", icon: Search },
];

const bottomNavItems = [
  { label: "Admin", href: "/admin", icon: ShieldCheck },
  { label: "Om", href: "/om", icon: Info },
  { label: "Inställningar", href: "/settings", icon: Settings },
];

interface UserProfile {
  name: string;
  initials: string;
  org: string;
  role: string;
}

function SidebarContent({ pathname, user }: { pathname: string; user: UserProfile }) {
  return (
    <div className="flex h-full flex-col sidebar-gradient custom-scrollbar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <Image
          src="/omvarldsradar-logo.png"
          alt="OmvärldsRadar"
          width={34}
          height={34}
          className="rounded-lg ring-1 ring-white/10"
        />
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">OmvärldsRadar</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-blue-300/60">Omvärldsbevakning</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Meny</p>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "nav-active bg-white/10 text-white shadow-sm shadow-black/10"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-blue-400" : "")} />
                {item.label}
              </Link>
            );
          })}

          <div className="my-3 mx-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">System</p>

          {bottomNavItems
            .filter((item) => item.href !== "/admin" || user.role === "admin")
            .map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "nav-active bg-white/10 text-white shadow-sm shadow-black/10"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white/90"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-blue-400" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User info */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-blue-500/20 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/20">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white/90">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-white/40">
              {user.org}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: "",
    initials: "",
    org: "",
    role: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        // Hämta profil via server-side API (kringgår RLS-problem)
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;
        const data = await res.json();
        setUser({
          name: data.name || "",
          initials: data.initials || "",
          org: data.org || "",
          role: data.role || "viewer",
        });
      } catch (err) {
        console.error("[Layout] User load error:", err);
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 lg:block">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar — glass effect */}
        <header className="topbar-glass flex h-14 shrink-0 items-center gap-4 border-b border-border/50 px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden -ml-1">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Öppna meny</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[260px] border-r-0 p-0"
              showCloseButton={false}
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent pathname={pathname} user={user} />
            </SheetContent>
          </Sheet>

          {/* Search — full bar on desktop, icon link on mobile */}
          <Button variant="ghost" size="icon" className="md:hidden" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Sök</span>
            </Link>
          </Button>
          <form
            className="relative hidden flex-1 md:block md:max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement)?.value?.trim();
              if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
              else router.push("/search");
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              name="q"
              placeholder="Sök artiklar, trender, ämnesområden..."
              className="pl-9 h-9 bg-muted/40 border-0 rounded-lg text-sm placeholder:text-muted-foreground/50 focus-visible:bg-muted/60 transition-colors"
            />
          </form>

          <div className="ml-auto flex items-center gap-1">
            {/* Dark mode toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={theme === "dark" ? "Byt till ljust tema" : "Byt till mörkt tema"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Byt tema</span>
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifieringar</span>
            </Button>

            <div className="mx-1 h-6 w-px bg-border/50" />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 px-2 h-9 rounded-lg"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {user.initials || ".."}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:inline-block">
                    {user.name || "Laddar..."}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.org}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Inställningar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logga ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

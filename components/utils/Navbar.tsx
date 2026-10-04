"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  LogOut,
  User,
  ArrowRight,
  Zap,
  MoonIcon,
  SunIcon,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/userStore";
import { useThemeStore } from "@/store/ThemeStore";
import ChooseRoleDialog from "./roleSelction";
import { trpc } from "@/trpc/client";

function Navbar() {
  const pathname = usePathname();

  // Theme Store
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Auth Store
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const resetAuth = useAuthStore((state) => state.resetAuth);
  // Component State
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark" | null>(
    null,
  );

  // TRPC Mutation
  const { mutateAsync: updateUser } = trpc.user.updateRole.useMutation();

  const handleSelectRole = async (role: "teacher" | "student") => {
    try {
      const updatedUser = await updateUser({ role });

      setIsRoleDialogOpen(false);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  useEffect(() => {
    if (theme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setResolvedTheme(systemDark ? "dark" : "light");
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  const userImage =
    user?.image ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${
      user?.name ?? "default"
    }`;

  const navLinks = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "Upload", href: "/upload" },
      { name: "Test", href: "/test" },
      { name: "Docs", href: "/docs" },
    ],
    [],
  );

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      resetAuth();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
        <nav className="max-w-7xl mx-auto h-16 rounded-2xl px-6 flex items-center justify-between pointer-events-auto bg-background/80 backdrop-blur-md border border-border/50 shadow-sm">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-foreground text-background p-1.5 rounded-lg">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Orion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl hover:bg-muted"
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>

            {isLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-9 w-9 rounded-xl overflow-hidden border border-border shadow-sm hover:scale-105 transition-all">
                    <Image
                      src={userImage}
                      alt="User profile"
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl p-2 shadow-2xl"
                >
                  <DropdownMenuLabel className="flex flex-col p-3">
                    <span className="text-sm font-bold">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    asChild
                    className="rounded-lg cursor-pointer"
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      <User size={16} />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setIsRoleDialogOpen(true)}
                    className="rounded-lg cursor-pointer gap-2"
                  >
                    <Briefcase size={16} />
                    <span className="capitalize">
                      {user.role ? `Role: ${user.role}` : "Select Role"}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg cursor-pointer gap-2 text-destructive"
                  >
                    <LogOut size={16} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-3 py-2 hover:opacity-80"
                >
                  Sign in
                </Link>

                <Link href="/register">
                  <Button className="rounded-full px-5 gap-1.5">
                    Start free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl bg-muted"
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl bg-muted"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full sm:w-80 rounded-l-4xl"
              >
                <SheetHeader className="mb-8 text-left">
                  <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href}>
                      <div className="p-3 rounded-xl hover:bg-muted font-medium">
                        {link.name}
                      </div>
                    </Link>
                  ))}
                  {user && (
                    <button
                      onClick={() => setIsRoleDialogOpen(true)}
                      className="p-3 rounded-xl hover:bg-muted font-medium text-left flex items-center gap-2"
                    >
                      <Briefcase size={16} />
                      <span className="capitalize">
                        Role: {user.role || "Not Set"}
                      </span>
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>

      <ChooseRoleDialog
        isOpen={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
        onSubmitRole={handleSelectRole}
      />
    </>
  );
}

export default Navbar;

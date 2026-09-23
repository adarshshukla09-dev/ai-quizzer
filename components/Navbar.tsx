"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Menu, LogOut, User, ArrowRight, Zap } from "lucide-react";

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

function Navbar() {
  const pathname = usePathname();
  const { data } = authClient.useSession();
  const user = data?.user;

  const userImage =
    user?.image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "default"}`;

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  const navLinks = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "Upload", href: "/upload" },
      { name: "Test", href: "/test" },
      { name: "Docs", href: "/docs" },
    ],
    [],
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
      <nav className="max-w-7xl mx-auto h-16 rounded-2xl px-6 flex items-center justify-between pointer-events-auto bg-background/80 backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-foreground text-background p-1.5 rounded-lg">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Orion
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <span
                className={`text-lg font-medium transition-colors hover:text-foreground ${
                  isActive(link.href)
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Right CTA / User Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative h-9 w-9 rounded-xl overflow-hidden cursor-pointer border border-border shadow-sm hover:scale-105 transition-all">
                  <img
                    src={userImage}
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl p-2 shadow-2xl"
              >
                <DropdownMenuLabel className="flex flex-col p-3">
                  <span className="text-sm font-bold text-foreground">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="rounded-lg cursor-pointer hover:text-primary focus:text-primary"
                >
                  <Link href="/profile" className="flex items-center gap-2">
                    <User size={16} /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => authClient.signOut()}
                  className="rounded-lg cursor-pointer gap-2 text-destructive focus:bg-destructive/10"
                >
                  <LogOut size={16} /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity px-3 py-2"
              >
                Sign in
              </Link>
              <Link href="/register">
                <Button className="bg-foreground text-background hover:opacity-90 rounded-full px-5 font-medium text-sm transition-all gap-1.5 h-10">
                  Start free <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-3">
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
            <SheetContent side="right" className="w-full sm:w-80 rounded-l-4xl">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href}>
                    <div className="p-3 rounded-xl hover:bg-muted font-medium text-foreground transition-all">
                      {link.name}
                    </div>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;

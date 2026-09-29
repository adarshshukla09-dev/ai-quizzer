"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuthStore } from "@/store/userStore";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    console.log(user);
  }, []);
  return (
    <main className="container relative flex flex-col mx-auto min-h-screen w-full items-center justify-center overflow-hidden p-6">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-72
          left-1/2
          -translate-x-1/2
          w-150 sm:w-225
          h-100 sm:h-150
          bg-[radial-gradient(ellipse_at_top,var(--primary),transparent_70%)]
          opacity-30
          blur-3xl
          z-0
        "
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Version Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/70 backdrop-blur-sm shadow-xs mb-8 text-xs font-medium text-foreground">
          <span>Now in general availability</span>
          <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md font-bold text-[10px]">
            v2.0
          </span>
        </div>

        {/* Hero Title */}
        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight max-w-3xl leading-[1.08] mb-6 bg-linear-to-t from-black via-white to-orange-500 bg-clip-text text-transparent select-none">
          The AI brain for every workflow
        </h1>

        {/* Subtitle with optional Dark-to-Orange Gradient */}
        <p className="text-lg sm:text-xl max-w-2xl font-normal leading-relaxed mb-8 bg-linear-to-bl from-orange-600 via-slate-200 to-orange-500 bg-clip-text text-transparent">
          Orion learns how your team works and surfaces the right insight,
          action, or automation — before you have to ask.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          {/* Get Started Button */}
          <Button
            asChild
            className="rounded-full px-7 h-12 text-sm font-medium shadow-md gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          >
            <Link href="/register">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            className="rounded-full px-6 h-12 text-sm font-medium bg-card/80 border-border hover:bg-accent gap-2 text-foreground shadow-xs transition-all duration-200"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Watch demo
          </Button>
        </div>

        {/* Sub-caption */}
        <p className="text-xs text-muted-foreground font-medium">
          No credit card required · Free for teams up to 5
        </p>
      </div>
    </main>
  );
}

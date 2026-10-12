"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import { Hero } from "@/components/landing/hero";
import { Manifesto } from "@/components/landing/Manifesto";
import { ClientMarquee } from "@/components/landing/ClientMarquee";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Work } from "@/components/landing/Work";
import { Stats } from "@/components/landing/Stats";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";


export default function App() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    // Track cursor movement across all sections
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("mousemove", handleMouseMove);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen relative">
      {/* Global White Cursor Follower Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-3.5 h-3.5 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference shadow-[0_0_10px_rgba(255,255,255,0.8)]"
      />

      <main>
        <Hero />
        <Manifesto />
        <ClientMarquee />
        <HowItWorks />
        <Work />
        <Stats />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}
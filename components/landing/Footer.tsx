"use client";

import React from "react";

export const Footer = () => (
  <footer
    id="contact"
    className="w-full bg-[#050505] text-white pt-28 pb-12 relative overflow-hidden border-t border-white/10"
  >
    <div className="px-6 md:px-24 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-24 gap-12">
      <h2 className="text-[10vw] md:text-[6vw] font-serif leading-[0.9] tracking-tighter w-full md:w-2/3">
        Ready to test
        <br />
        <span className="italic text-white/40">from your content?</span>
      </h2>

      <div className="w-full md:w-1/3 flex md:justify-end">
        <a
          href="/create"
          className="group relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-full bg-white text-black hover:scale-105 transition-transform duration-500 overflow-hidden text-center p-4"
        >
          <span className="absolute inset-0 bg-indigo-600 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold relative z-10 group-hover:text-white">
            Create Test Now
          </span>
        </a>
      </div>
    </div>

    <div className="px-6 md:px-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 mb-20">
      <div className="flex flex-col gap-6">
        <p className="text-white/40 text-xs leading-relaxed max-w-xs font-mono">
          Transform learning materials into intelligent knowledge bases and
          instant student assessments.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-mono text-xs uppercase tracking-widest text-indigo-400 mb-2">
          Navigation
        </h4>
        <a href="#hero" className="text-white/60 hover:text-white text-sm">
          Home
        </a>
        <a
          href="#how-it-works"
          className="text-white/60 hover:text-white text-sm"
        >
          How It Works
        </a>
        <a href="#features" className="text-white/60 hover:text-white text-sm">
          Platform Features
        </a>
        <a href="#faq" className="text-white/60 hover:text-white text-sm">
          FAQ
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-mono text-xs uppercase tracking-widest text-indigo-400 mb-2">
          Capabilities
        </h4>
        <span className="text-white/60 text-sm">PDF & PPT Ingestion</span>
        <span className="text-white/60 text-sm">Topic Graph Generation</span>
        <span className="text-white/60 text-sm">Instant Student Testing</span>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-mono text-xs uppercase tracking-widest text-indigo-400 mb-2">
          Platform Status
        </h4>
        <span className="text-emerald-400 text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Engine Operational v2.0
        </span>
        <p className="text-white/40 text-xs font-mono mt-2">
          Ready for document uploads and assessment generation.
        </p>
      </div>
    </div>

    <div className="px-6 md:px-24 max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono text-white/40">
      <p>© 2026 AURA AI Assessment Platform.</p>
      <div className="flex gap-6">
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
      </div>
    </div>

    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-[300px] bg-indigo-600 opacity-5 blur-[200px] pointer-events-none" />
  </footer>
);

export default Footer;
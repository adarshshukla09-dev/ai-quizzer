"use client";

import React from "react";

const stats = [
  ["100", "%", "Source Grounding"],
  ["< 30", "s", "Generation Time"],
  ["10k", "+", "Questions Tested"],
  ["0", " Setup", "Instant Attempts"],
];

export const Stats = () => (
  <section
    id="features"
    className="w-full bg-[#050505] text-white py-20 md:py-28 border-t border-b border-white/5"
  >
    <div className="max-w-7xl mx-auto px-6 md:px-24 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
      {stats.map(([number, suffix, label]) => (
        <div key={label} className="flex flex-col gap-2 md:items-center">
          <h4 className="text-3xl md:text-5xl font-serif tracking-tight text-white">
            <span className="text-indigo-400">{number}</span>
            <span className="text-white/60">{suffix}</span>
          </h4>

          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
            {label}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default Stats;
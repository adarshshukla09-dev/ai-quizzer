"use client";

import React from "react";

const assessmentExamples = [
  [
    "01",
    "Computer Architecture & Systems",
    "PDF Module Ingestion",
    "15 Questions",
  ],
  [
    "02",
    "Molecular Genetics Fundamentals",
    "PPT Deck Processing",
    "20 Questions",
  ],
  [
    "03",
    "Macroeconomics & Monetary Policy",
    "Textbook Chapter Sync",
    "25 Questions",
  ],
  ["04", "Data Structures & Graph Theory", "Code & Doc Hybrid", "12 Questions"],
];

export const Work = () => (
  <section
    id="assessments"
    className="w-full bg-[#050505] text-white py-28 border-t border-white/10"
  >
    <div className="px-6 md:px-24 mb-20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
      <h2 className="text-4xl md:text-7xl font-serif tracking-tight">
        Generated
        <br />
        <span className="italic text-white/40">Assessment Examples.</span>
      </h2>

      <p className="text-white/50 max-w-sm text-base leading-relaxed pb-2">
        A sample of automated test packages built directly from uploaded course
        documentation.
      </p>
    </div>

    <div className="px-6 md:px-24 max-w-7xl mx-auto">
      <div className="flex border-b border-white/20 pb-4 mb-4 text-xs font-mono text-white/40 uppercase tracking-widest px-4">
        <div className="w-16">ID</div>
        <div className="flex-1">Topic Assessment</div>
        <div className="hidden md:block w-1/3">Source Ingestion</div>
        <div className="w-24 text-right">Scope</div>
      </div>

      {assessmentExamples.map(([id, topic, source, scope]) => (
        <a
          href="/create"
          key={id}
          className="group flex items-center border-b border-white/10 py-6 md:py-10 px-4 hover:bg-white/5 transition-colors duration-500 relative overflow-hidden"
        >
          <div className="w-16 text-sm font-mono text-white/30 group-hover:text-indigo-400 z-10">
            {id}
          </div>

          <div className="flex-1 z-10">
            <h3 className="text-2xl md:text-4xl font-serif text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500">
              {topic}
            </h3>
          </div>

          <div className="hidden md:block w-1/3 text-sm font-mono text-white/40 group-hover:text-white/80 z-10">
            {source}
          </div>

          <div className="w-24 text-right text-xs font-mono text-indigo-400 group-hover:text-indigo-300 z-10">
            {scope}
          </div>
        </a>
      ))}

      <div className="mt-16 flex justify-center">
        <a
          href="/create"
          className="px-8 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white hover:text-black transition-colors duration-500 text-xs font-mono uppercase tracking-widest"
        >
          Build Test From Your Content
        </a>
      </div>
    </div>
  </section>
);

export default Work;
"use client";

import React from "react";

export const ClientMarquee = () => {
  const formats = [
    "PDF Documents",
    "PowerPoint Slides",
    "Lecture Transcripts",
    "Word Docs",
    "Markdown Notes",
    "Research Papers",
    "Course Syllabi",
    "Textbook Chapters",
  ];

  return (
    <section className="w-full bg-[#050505] py-12 md:py-20 overflow-hidden border-t border-white/5">
      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8 text-center">
        Supported Learning Material Formats
      </p>

      <div className="relative overflow-hidden">
        {/* Left & Right gradient fades */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {/* First set */}
          <div className="flex shrink-0">
            {formats.map((format, index) => (
              <div
                key={`first-${index}`}
                className="mx-8 md:mx-16 shrink-0 text-xl md:text-3xl font-serif text-white/30 hover:text-indigo-300 transition-colors duration-500 flex items-center gap-3 cursor-default"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500/50 shrink-0" />
                {format}
              </div>
            ))}
          </div>

          {/* Duplicated set for seamless loop */}
          <div className="flex shrink-0">
            {formats.map((format, index) => (
              <div
                key={`second-${index}`}
                className="mx-8 md:mx-16 shrink-0 text-xl md:text-3xl font-serif text-white/30 hover:text-indigo-300 transition-colors duration-500 flex items-center gap-3 cursor-default"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500/50 shrink-0" />
                {format}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientMarquee;
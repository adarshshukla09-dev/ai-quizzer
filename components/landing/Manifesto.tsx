"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const manifestoLines = [
  "Traditional assessment is broken, rigid, and slow.",
  "Education shouldn't force static testing on dynamic minds.",
  "Your course content contains the true DNA of knowledge.",
  "We leverage AI to bridge static documentation and active evaluation.",
  "Instant, context-grounded tests crafted directly from your source material.",
  "Empowering educators, elevating students, and transforming assessments forever.",
];

export const Manifesto = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      wordRefs.current.forEach((word) => {
        if (!word) return;

        gsap.fromTo(
          word,
          {
            opacity: 0.25,
            color: "rgba(255,255,255,0.3)",
          },
          {
            opacity: 1,
            color: "rgba(255,255,255,1)",
            ease: "none",
            scrollTrigger: {
              trigger: word,
              start: "top 65%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="w-full min-h-screen bg-[#050505] text-white py-32 px-6 flex flex-col justify-center items-center relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 text-center md:text-left">
        {manifestoLines.map((text, lineIndex) => {
          const words = text.split(" ");

          return (
            <p
              key={lineIndex}
              className="text-2xl sm:text-4xl md:text-5xl font-serif font-light leading-snug tracking-tight"
            >
              {words.map((word, wordIndex) => {
                const refIndex =
                  manifestoLines
                    .slice(0, lineIndex)
                    .reduce(
                      (total, line) => total + line.split(" ").length,
                      0
                    ) + wordIndex;

                return (
                  <React.Fragment key={wordIndex}>
                    <span
                      ref={(el) => {
                        wordRefs.current[refIndex] = el;
                      }}
                      className="inline-block opacity-25 text-white/30"
                    >
                      {word}
                    </span>

                    {wordIndex < words.length - 1 && " "}
                  </React.Fragment>
                );
              })}
            </p>
          );
        })}
      </div>
    </section>
  );
};

export default Manifesto;
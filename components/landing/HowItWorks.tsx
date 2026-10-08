"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UploadCloud, Brain, CheckCircle2 } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const workflowSteps = [
  {
    number: "01",
    title: "Upload Learning Material",
    description:
      "Drop in your lecture PDFs, PowerPoint presentations, or research documents. Our system ingests and structures your custom curriculum.",
    icon: UploadCloud,
  },
  {
    number: "02",
    title: "Build Knowledge Base",
    description:
      "AI indexes key topics, relationships, and concepts across your material without external assumptions or generic fluff.",
    icon: Brain,
  },
  {
    number: "03",
    title: "Generate & Attempt Tests",
    description:
      "Create tailored quizzes for specific topics in seconds. Share access links and let students test their knowledge immediately.",
    icon: CheckCircle2,
  },
];

export const HowItWorks = () => {
  const cards = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    cards.current.forEach((card, index) => {
      if (!card) return;

      gsap.fromTo(
        card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: index * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });
  }, []);

  return (
    <section
      id="how-it-works"
      className="w-full bg-[#050505] text-white py-28 md:py-40 border-t border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-indigo-600 opacity-[0.03] blur-[200px] rounded-full" />

      <div className="max-w-350 mx-auto px-6 md:px-12">
        <span className="text-xs font-mono text-indigo-400 uppercase tracking-[0.3em] mb-12 text-center block">
          How The Platform Works
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                ref={(el) => {
                  cards.current[index] = el;
                }}
                className="group relative w-full h-[45vh] md:h-[55vh] lg:h-[65vh] rounded-3xl overflow-hidden border border-white/10 bg-[#0A0A0A] p-8 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10" />

                <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600 opacity-[0.03] group-hover:opacity-[0.15] blur-[100px] rounded-full transition-opacity duration-700" />

                <div className="relative z-20 flex justify-between items-start">
                  <span className="font-serif text-5xl text-white/10 group-hover:text-indigo-400/40 transition-colors duration-700">
                    {step.number}
                  </span>

                  <div className="text-white/30 group-hover:text-indigo-400 transition-all duration-700 group-hover:scale-110 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="relative z-20 flex flex-col gap-4 transform-gpu transition-all duration-700 group-hover:-translate-y-2">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif leading-tight">
                    {step.title}
                  </h3>

                  <div className="w-full h-px bg-indigo-500/30 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />

                  <p className="text-sm md:text-base text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
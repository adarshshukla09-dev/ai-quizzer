"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

const faqItems = [
  {
    q: "How does the AI generate tests without making things up?",
    a: "Our AI builds an isolated Knowledge Base strictly from your uploaded files (PDFs, PPTs, Docs). It generates questions grounded only in that source material, preventing out-of-scope content or generic hallucinations.",
  },
  {
    q: "Can students take tests directly on the platform?",
    a: "Yes. Once you generate an assessment for a specific topic, you get a shareable link where students can attempt the test, submit answers, and view immediate results.",
  },
  {
    q: "What document types can I upload?",
    a: "You can upload PDF lecture notes, PowerPoint presentation slides (.pptx), Word documents, and text files. Multiple files can be combined into a single Knowledge Base.",
  },
  {
    q: "Can I customize the question types and difficulty?",
    a: "Yes. You can filter assessments by specific topics, adjust question formats (multiple choice, conceptual short-answer), and select desired difficulty levels prior to generation.",
  },
];

export const FAQ = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="w-full bg-[#050505] text-white py-28 border-t border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 opacity-5 blur-[150px] rounded-full" />

      <div className="px-6 md:px-24 max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 relative z-10">
        <div className="w-full md:w-1/3">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-4 block">
            FAQ
          </span>

          <h2 className="text-3xl md:text-5xl font-serif leading-tight">
            Frequently
            <br />
            <span className="italic text-white/40">Asked.</span>
          </h2>

          <p className="text-white/50 mt-6 font-light text-sm leading-relaxed">
            Everything you need to know about document ingestion, knowledge base
            indexing, and assessment delivery.
          </p>

          <a
            href="/create"
            className="inline-flex items-center gap-2 mt-8 text-xs font-mono text-indigo-400 uppercase hover:text-indigo-300"
          >
            Start building now
            <span className="w-8 h-px bg-indigo-400" />
          </a>
        </div>

        <div className="w-full md:w-2/3 flex flex-col">
          {faqItems.map((item, index) => {
            const isOpen = active === index;

            return (
              <button
                key={item.q}
                onClick={() => setActive(isOpen ? null : index)}
                className="w-full border-b border-white/10 py-6 text-left"
                aria-expanded={isOpen}
              >
                <div className="w-full flex justify-between items-center gap-6">
                  <span className="text-xl md:text-2xl font-serif text-white/90">
                    {item.q}
                  </span>

                  <div
                    className={`shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-500 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <Plus size={18} />
                  </div>
                </div>

                <div
                  className={`grid transition-all duration-500 ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-white/40 text-sm leading-relaxed max-w-2xl">
                      {item.a}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
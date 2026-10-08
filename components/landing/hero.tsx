import { ArrowRight, FileText, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gapPathRef = useRef<SVGPathElement>(null);

  const handleWordMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    // 1. Magnetic Text Motion
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(target, {
      x: x * 0.25,
      y: y * 0.25,
      rotationX: -y * 0.1,
      rotationY: x * 0.1,
      duration: 0.3,
      ease: "power2.out",
    });

    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();

    // Convert mouse coordinates to 600x600 SVG space
    const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * 600;
    const mouseY = ((e.clientY - svgRect.top) / svgRect.height) * 600;

    const centerX = 300;
    const centerY = 300;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const mouseRadius = Math.sqrt(dx * dx + dy * dy);

    // 2. Animate ALL Concentric Circles (Both Glow + Fine Lines)
    const allCircles = containerRef.current.querySelectorAll("circle");

    gsap.to(allCircles, {
      attr: {
        r: (i: number, circleTarget: SVGCircleElement) => {
          // Identify index within its own 25-ring set
          const ringIndex = i % 25;
          const baseRadius = 25 + ringIndex * 11.5;

          // Distance from cursor to this ring's radius
          const distance = Math.abs(baseRadius - mouseRadius);
          const influence = Math.max(0, 1 - distance / 70);

          return baseRadius + influence * 22;
        },
      },
      duration: 0.35,
      ease: "power3.out",
      overwrite: "auto",
    });

    // 3. Localized Focus Arc (Dynamic gap around the hovered word)
    if (gapPathRef.current) {
      const angle = Math.atan2(dy, dx);
      const gapSpread = 0.45; // Spread of the arc opening in radians
      const startAngle = angle - gapSpread;
      const endAngle = angle + gapSpread;

      const rOuter = Math.min(Math.max(mouseRadius, 60), 280);
      const rInner = Math.max(rOuter - 40, 20);

      const x1 = centerX + rOuter * Math.cos(startAngle);
      const y1 = centerY + rOuter * Math.sin(startAngle);
      const x2 = centerX + rOuter * Math.cos(endAngle);
      const y2 = centerY + rOuter * Math.sin(endAngle);

      const x3 = centerX + rInner * Math.cos(endAngle);
      const y3 = centerY + rInner * Math.sin(endAngle);
      const x4 = centerX + rInner * Math.cos(startAngle);
      const y4 = centerY + rInner * Math.sin(startAngle);

      const pathData = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;

      gsap.to(gapPathRef.current, {
        attr: { d: pathData },
        opacity: 0.15,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleWordMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    // Reset Magnetic Text
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });

    if (!containerRef.current) return;
    const allCircles = containerRef.current.querySelectorAll("circle");

    // Smoothly Restore Circles
    gsap.to(allCircles, {
      attr: {
        r: (i: number) => {
          const ringIndex = i % 25;
          return 25 + ringIndex * 11.5;
        },
      },
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.005,
      overwrite: "auto",
    });

    // Fade out localized focus arc
    if (gapPathRef.current) {
      gsap.to(gapPathRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  return (
    <section
      id="hero"
      className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-center pt-28 pb-16"
    >
      <div className="absolute -inset-12 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-b from-[#050505]/40 via-[#050505]/10 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#050505_90%)]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-indigo-600/10 blur-[140px] rounded-full" />

        {/* Dynamic Concentric Background */}
        <div
          ref={containerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <svg
            width="600"
            height="600"
            viewBox="0 0 600 600"
            className="w-75 h-75 sm:w-125 sm:h-125 md:w-150 md:h-150"
          >
            <defs>
              <filter
                id="softGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="1.8" />
              </filter>

              <radialGradient id="fade">
                <stop offset="0%" stopColor="white" stopOpacity="0.7" />
                <stop offset="55%" stopColor="white" stopOpacity="0.35" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Layer 1: Soft Blurred Background Glow */}
            <g
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
              filter="url(#softGlow)"
            >
              {Array.from({ length: 25 }, (_, i) => {
                const r = 25 + i * 11.5;
                return <circle key={`glow-${i}`} cx="300" cy="300" r={r} />;
              })}
            </g>

            {/* Layer 2: Interactive Fine Concentric Lines */}
            <g fill="none" stroke="url(#fade)" strokeWidth="0.6">
              {Array.from({ length: 25 }, (_, i) => {
                const r = 25 + i * 11.5;
                return <circle key={`fine-${i}`} cx="300" cy="300" r={r} />;
              })}
            </g>

            {/* Layer 3: Localized Hover Arc Highlight */}
            <path
              ref={gapPathRef}
              fill="white"
              opacity="0"
              className="pointer-events-none mix-blend-overlay"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 w-full h-full px-4 flex flex-col items-center justify-center">
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/30 backdrop-blur-md">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-300">
            AI-Powered Assessment Platform
          </span>
        </div>

        {/* Main headline with interactive magnetic words */}
        <h1 className="text-[11vw] sm:text-[8vw] md:text-[6vw] lg:text-[5.5vw] font-serif leading-[0.95] tracking-tight text-white max-w-[95vw] md:max-w-6xl mx-auto flex flex-col items-center mb-6 select-none">
          <div className="overflow-hidden pb-2 flex flex-wrap justify-center gap-x-4">
            {["Your", "Content.", "Their", "Test."].map((word, idx) => (
              <span
                key={idx}
                onMouseMove={handleWordMouseMove}
                onMouseLeave={handleWordMouseLeave}
                className="inline-block cursor-default"
              >
                {word}
              </span>
            ))}
          </div>

          <div className="overflow-hidden pb-4">
            <div className="flex items-center gap-3">
              <span
                onMouseMove={handleWordMouseMove}
                onMouseLeave={handleWordMouseLeave}
                className="italic font-serif text-white/50 inline-block cursor-default"
              >
                Powered by
              </span>
              <span
                onMouseMove={handleWordMouseMove}
                onMouseLeave={handleWordMouseLeave}
                className="bg-linear-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent inline-block cursor-default"
              >
                AI.
              </span>
            </div>
          </div>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl font-light leading-relaxed px-4 mb-10">
          Upload your PDFs, PPTs, and course material to build an intelligent
          knowledge base. Generate topic-specific tests and let students take
          them instantly.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
          <a
            href="/create"
            className="px-8 py-4 bg-white text-black rounded-xl font-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
          >
            Create Your First Test
            <ArrowRight size={16} />
          </a>

          <a
            href="#how-it-works"
            className="px-8 py-4 bg-transparent text-white border border-white/20 rounded-xl font-mono text-xs uppercase tracking-widest font-bold hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center"
          >
            Explore How It Works
          </a>
        </div>

        {/* Micro trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-xs font-mono text-white/40 uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            100% Content Grounded
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <FileText size={14} className="text-blue-400" />
            PDF, PPT & Doc Support
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <GraduationCap size={14} className="text-indigo-400" />
            Instant Student Evaluation
          </span>
        </div>
      </div>
    </section>
  );
};
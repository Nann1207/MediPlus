import React from "react";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import seaLandmarks from "@/assets/sea-landmarks.jpg";

/**
 * Full-bleed, image-led hero designed to be the very first thing people see.
 * - The image is the centerpiece (edge-to-edge, covers viewport)
 * - Copy is overlaid and readable thanks to a gradient scrim
 * - Single primary CTA: "Get Started" → "/home-dashboard"
 * - Paragraph sits near the top of the image (as requested)
 */
const HeroSection = () => {
  return (
    <section
      className="relative min-h-[100svh] w-full overflow-hidden"
      aria-label="Southeast Asia health & wellness hero"
    >
      {/* Background image */}
      <img
        src={seaLandmarks}
        alt="Southeast Asian landmarks representing our regional health network"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />

      {/* Readability scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />

      {/* Floating decorative bubbles (subtle) */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="sea-float absolute top-16 left-16 h-24 w-24 rounded-full bg-cyan-400/40 blur-[2px]" />
        <div className="sea-float absolute right-24 top-40 h-16 w-16 rounded-full bg-rose-400/40 blur-[2px]" style={{ animationDelay: "0.8s" }} />
        <div className="sea-float absolute bottom-24 left-1/4 h-12 w-12 rounded-full bg-emerald-400/40 blur-[2px]" style={{ animationDelay: "1.6s" }} />
      </div>

      {/* Content layer */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Top paragraph (sits near the top of the image) */}
        <div className="pt-10 sm:pt-14 lg:pt-16" />
        <p className="mx-auto max-w-4xl text-center text-base font-medium text-white/90 sm:text-lg lg:text-xl drop-shadow-md">
          Empowering millions across Southeast Asia with AI-powered health tracking,
          mental wellness support, medical guidance, and culturally-aware wellness programmes.
          Your health journey starts here.
        </p>

        {/* Main headline + CTA anchored near centre for impact */}
        <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="max-w-5xl text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-6xl">
            Your one‑stop destination for <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-orange-300">health & wellness</span>
            <span className="block text-2xl font-semibold text-white/90 sm:text-3xl">in Southeast Asia</span>
          </h1>

          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="group rounded-2xl px-6 py-6 text-base font-semibold backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >

            </Button>
          </div>
        </div>

        {/* Bottom spacing so content doesn’t hug the edge on mobile */}
        <div className="pb-8 sm:pb-10" />
      </div>

      {/* Subtle vignette edge to focus the eye */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 [box-shadow:inset_0_0_120px_40px_rgba(0,0,0,0.45)]" />

      {/* Keyframe helpers (if not already defined) */}
      <style>{`
        .sea-float { animation: sea-float 6s ease-in-out infinite; }
        @keyframes sea-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
// src/pages/InProgress.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import underConstruction from "@/assets/underConstruction.svg";
import engine from "@/assets/engine.gif";
import engine2 from "@/assets/engine2.gif";
import engine3 from "@/assets/engine3.gif";

const InProgress: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">In Progress — Round 2</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This page is a placeholder, more features to be added in Round 2.
          </p>
        </div>

        {/* Center column: SVG on top, horizontal gears below */}
        <div className="mx-auto w-full flex flex-col items-center">
          <div className="w-[min(92vw,720px)]">
            {/* SVG (top) */}
            <div className="p-3">
              <div className="h-[380px] md:h-[520px] flex items-center justify-center">
                <img
                  src={underConstruction}
                  alt="Under construction illustration"
                  className="h-full w-auto object-contain select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* Gears (bottom) — horizontal*/}
            <div className="mt-4 overflow-hidden">
              <div className="flex items-center justify-center gap-[2px]">
                {[engine, engine2, engine3].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Engine ${i + 1}`}
                    draggable={false}
                    className="select-none shrink-0"
                    style={{
                      height: 50,      
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tiny footnote */}
          <div className="text-xs text-muted-foreground mt-6">
            Thanks for your patience — polishing features & visuals.
          </div>
        </div>
      </div>
    </main>
  );
};

export default InProgress;

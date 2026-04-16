"use client";

import { Bot, Orbit, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppMode = "ask" | "avatar" | "arena";

type ModeSelectorProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

const modes: Array<{
  id: AppMode;
  title: string;
  description: string;
  icon: typeof Bot;
}> = [
  {
    id: "ask",
    title: "Ask AI",
    description: "General chat, explanations, and idea support.",
    icon: Bot,
  },
  {
    id: "avatar",
    title: "My Avatar",
    description: "Grounded digital twin based on your profile.",
    icon: UserRound,
  },
  {
    id: "arena",
    title: "Agent Arena",
    description: "Thinker, Critic, and Judge on one topic.",
    icon: Orbit,
  },
];

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] bg-white/56 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]">
      {modes.map((item) => {
        const active = item.id === mode;

        return (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "h-auto rounded-[24px] px-4 py-4 text-left",
              active ? "bg-white/88 shadow-[0_18px_36px_rgba(162,129,238,0.18)]" : "bg-transparent hover:bg-white/60",
            )}
            onClick={() => onModeChange(item.id)}
          >
            <div className="flex w-full items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex size-11 items-center justify-center rounded-2xl",
                  active ? "bg-primary text-primary-foreground" : "bg-primary/12 text-primary",
                )}
              >
                <item.icon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{item.title}</span>
                  {active ? <span className="text-xs uppercase tracking-[0.2em] text-primary">Active</span> : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

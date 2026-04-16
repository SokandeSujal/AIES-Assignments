"use client";

import { useState } from "react";
import { BrainCircuit, Play, Scale, ShieldAlert, Volume2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ArenaResponse } from "@/lib/utils";

type ArenaPanelProps = {
  result: ArenaResponse;
  isLoading: boolean;
  onRun: (topic: string) => void;
  onSpeak: (text: string) => void;
};

const arenaCards = [
  {
    key: "thinker",
    title: "Thinker",
    description: "Builds the strongest first-pass argument.",
    icon: BrainCircuit,
  },
  {
    key: "critic",
    title: "Critic",
    description: "Challenges assumptions and exposes weak logic.",
    icon: ShieldAlert,
  },
  {
    key: "judge",
    title: "Judge",
    description: "Synthesises the best final answer.",
    icon: Scale,
  },
] as const;

export function ArenaPanel({ result, isLoading, onRun, onSpeak }: ArenaPanelProps) {
  const [topic, setTopic] = useState("Should AI replace traditional classrooms?");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <div className="orb-core size-28 rounded-full" />
        <p className="text-gradient mt-8 text-3xl font-semibold">Agent Arena</p>
        <h1 className="mt-2 max-w-3xl font-heading text-5xl leading-none text-foreground md:text-6xl">
          Let three agents reason in sequence
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
          The Thinker creates the opening position, the Critic pressure-tests it, and the Judge
          resolves the debate into a final synthesis. This is the clearest LangGraph moment in the
          demo.
        </p>
      </div>

      <div className="mt-8 rounded-[30px] bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <div className="rounded-[28px] border border-primary/8 bg-white/76 p-4">
          <Textarea
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Enter a topic for the agents to debate..."
            className="min-h-28 resize-none border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
                LangGraph
              </Badge>
              <span>Three-node linear debate workflow</span>
            </div>
            <Button
              className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              onClick={() => onRun(topic)}
              disabled={isLoading || !topic.trim()}
            >
              <Play data-icon="inline-start" />
              Run arena
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid flex-1 gap-4 xl:grid-cols-3">
        {arenaCards.map((item) => {
          const content = result[item.key];

          return (
            <Card key={item.key} className="glass-card rounded-[28px] border-0 py-4 shadow-none">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white/70 text-primary shadow-[0_12px_28px_rgba(160,120,235,0.18)]">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                  {content ? (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-full bg-white/80"
                      onClick={() => onSpeak(content)}
                    >
                      <Volume2 />
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex h-full">
                <div className="w-full rounded-[24px] bg-white/72 p-4 text-sm leading-7 text-foreground/82">
                  {isLoading ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-4 w-full rounded-full bg-primary/12" />
                      <Skeleton className="h-4 w-[88%] rounded-full bg-primary/12" />
                      <Skeleton className="h-4 w-[72%] rounded-full bg-primary/12" />
                      <Skeleton className="h-24 w-full rounded-[20px] bg-primary/10" />
                    </div>
                  ) : content ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Run the arena to generate this agent&apos;s response.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

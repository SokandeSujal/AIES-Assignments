"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Bot,
  BrainCircuit,
  Download,
  Library,
  Link2,
  MessageCircleMore,
  Sparkles,
  UserRound,
} from "lucide-react";

import { ArenaPanel } from "@/app/components/ArenaPanel";
import { ChatInterface } from "@/app/components/ChatInterface";
import { ModeSelector, type AppMode } from "@/app/components/ModeSelector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  type ArenaResponse,
  type ChatMessage,
  createEmptyArena,
  exportMessages,
  runArena,
  sendChatRequest,
} from "@/lib/utils";

const sidebarItems = [
  { icon: Library, label: "Explore" },
  { icon: Bot, label: "Library" },
  { icon: Link2, label: "Files" },
  { icon: MessageCircleMore, label: "History" },
];

const quickPrompts = [
  {
    title: "Synthesize Data",
    description: "Turn my meeting notes into 5 key bullet points.",
  },
  {
    title: "Creative Brainstorm",
    description: "Generate 3 standout concepts for a new AI startup.",
  },
  {
    title: "Check Facts",
    description: "Compare the key differences between AI agents and chatbots.",
  },
];

export default function Home() {
  const [mode, setMode] = useState<AppMode>("ask");
  const [sessions, setSessions] = useState<Record<Exclude<AppMode, "arena">, ChatMessage[]>>({
    ask: [],
    avatar: [],
  });
  const [arenaData, setArenaData] = useState<ArenaResponse>(createEmptyArena());
  const [isPending, startTransition] = useTransition();

  const activeMessages = useMemo(
    () => (mode === "arena" ? [] : sessions[mode]),
    [mode, sessions],
  );
  const historyPreview = useMemo(
    () =>
      activeMessages
        .filter((message) => message.role === "user")
        .slice(-6)
        .reverse(),
    [activeMessages],
  );

  const speakText = (text: string) => {
    if (typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.05;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = (message: string) => {
    if (mode === "arena" || isPending) {
      return;
    }

    const currentMode = mode;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    const nextHistory = [...sessions[currentMode], userMessage];
    setSessions((prev) => ({
      ...prev,
      [currentMode]: nextHistory,
    }));

    startTransition(async () => {
      try {
        const response = await sendChatRequest(currentMode, message, nextHistory.slice(0, -1));
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.response,
        };

        setSessions((prev) => ({
          ...prev,
          [currentMode]: [...nextHistory, assistantMessage],
        }));
      } catch (error) {
        const fallback: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The request failed. Check that the backend is running and your API key is configured.",
        };

        setSessions((prev) => ({
          ...prev,
          [currentMode]: [...nextHistory, fallback],
        }));
      }
    });
  };

  const handleArenaRun = (topic: string) => {
    if (isPending) {
      return;
    }

    setArenaData(createEmptyArena());

    startTransition(async () => {
      try {
        const result = await runArena(topic);
        setArenaData(result);
        speakText(result.judge);
      } catch (error) {
        setArenaData({
          thinker: "The arena request did not complete.",
          critic:
            error instanceof Error
              ? error.message
              : "The backend returned an unexpected error.",
          judge: "Check the backend terminal and confirm your OpenAI API key is set.",
        });
      }
    });
  };

  const handleExport = () => {
    if (mode === "arena") {
      exportMessages("cortex-arena-session.txt", [
        { id: "1", role: "assistant", content: `Thinker\n${arenaData.thinker}` },
        { id: "2", role: "assistant", content: `Critic\n${arenaData.critic}` },
        { id: "3", role: "assistant", content: `Judge\n${arenaData.judge}` },
      ]);
      return;
    }

    exportMessages(`cortex-${mode}-chat.txt`, activeMessages);
  };

  const clearCurrent = () => {
    if (mode === "arena") {
      setArenaData(createEmptyArena());
      return;
    }

    setSessions((prev) => ({
      ...prev,
      [mode]: [],
    }));
  };

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="glass-panel noise-overlay flex flex-col rounded-[32px] p-5 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/18 text-primary shadow-[0_10px_25px_rgba(157,120,234,0.24)]">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="font-heading text-3xl leading-none">Cortex</p>
                <p className="text-muted-foreground">AI Studio for faculty demo</p>
              </div>
            </div>
          </div>

          <Button
            className="mt-6 h-14 rounded-2xl bg-[#181818] text-base text-white hover:bg-[#111]"
            onClick={clearCurrent}
          >
            <Sparkles data-icon="inline-start" />
            New session
          </Button>

          <div className="glass-card mt-5 rounded-2xl px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Session mode</p>
            <p className="mt-2 text-lg font-semibold">
              {mode === "ask" ? "Ask AI" : mode === "avatar" ? "Ask My Avatar" : "Agent Arena"}
            </p>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-medium text-foreground/85 transition hover:bg-white/55"
              >
                <item.icon className="size-[18px]" />
                {item.label}
              </button>
            ))}
          </nav>

          <Separator className="my-6 bg-white/70" />

          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Recent prompts</p>
            <div className="mt-4 flex flex-col gap-3">
              {historyPreview.length > 0 ? (
                historyPreview.map((message) => (
                  <Card key={message.id} className="glass-card rounded-2xl border-0 py-3 shadow-none">
                    <CardContent className="px-4">
                      <p className="line-clamp-2 text-sm leading-6 text-foreground/80">{message.content}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                quickPrompts.map((item) => (
                  <Card key={item.title} className="glass-card rounded-2xl border-0 py-3 shadow-none">
                    <CardContent className="px-4">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="glass-card mt-6 flex items-center gap-3 rounded-2xl p-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/15 text-primary">SS</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">Sujal Sokande</p>
              <p className="truncate text-sm text-muted-foreground">sokandesujal@gmail.com</p>
            </div>
          </div>
        </aside>

        <section className="glass-panel noise-overlay relative overflow-hidden rounded-[36px] px-4 py-4 md:px-6 md:py-5">
          <div className="grid-glow absolute inset-x-10 top-0 h-52 opacity-60" />
          <div className="relative flex h-full flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/18 text-primary">
                  <BrainCircuit className="size-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Cortex</p>
                  <p className="text-xs text-muted-foreground">
                    {mode === "arena" ? "Multi-agent reasoning" : "Live OpenAI session"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-2xl bg-white/75" onClick={handleExport}>
                  <Download data-icon="inline-start" />
                  Export chat
                </Button>
                <Button className="rounded-2xl bg-[#181818] px-4 text-white hover:bg-[#111]" onClick={clearCurrent}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-5 xl:flex-row">
              <div className="xl:w-[270px]">
                <ModeSelector mode={mode} onModeChange={setMode} />
              </div>

              <div className="glass-card relative flex min-h-[720px] flex-1 flex-col rounded-[32px] p-5 md:p-7">
                {mode === "arena" ? (
                  <ArenaPanel result={arenaData} isLoading={isPending} onRun={handleArenaRun} onSpeak={speakText} />
                ) : (
                  <ChatInterface
                    mode={mode}
                    messages={activeMessages}
                    isLoading={isPending}
                    onSend={handleSend}
                    onSpeak={speakText}
                  />
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-3">
              {quickPrompts.map((item, index) => (
                <Card key={item.title} className="glass-card rounded-[28px] border-0 py-4 shadow-none">
                  <CardHeader className="gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/70 text-primary shadow-[0_12px_28px_rgba(160,120,235,0.18)]">
                      {index === 0 ? (
                        <Sparkles className="size-5" />
                      ) : index === 1 ? (
                        <BrainCircuit className="size-5" />
                      ) : (
                        <UserRound className="size-5" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{item.title}</CardTitle>
                      <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
                        Prompt
                      </Badge>
                    </div>
                    <CardDescription className="leading-6">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

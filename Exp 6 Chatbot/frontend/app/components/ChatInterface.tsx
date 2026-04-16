"use client";

import { useMemo, useState } from "react";
import { Mic, SendHorizontal, Sparkles, Volume2 } from "lucide-react";

import type { AppMode } from "@/app/components/ModeSelector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn, type ChatMessage } from "@/lib/utils";

type ChatInterfaceProps = {
  mode: Exclude<AppMode, "arena">;
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onSpeak: (text: string) => void;
};

const presetPrompts = {
  ask: [
    "Explain agentic AI in simple terms.",
    "Summarise the difference between RAG and fine-tuning.",
    "Help me prepare viva points for this project.",
  ],
  avatar: [
    "Introduce yourself in first person.",
    "What are your strongest technical skills?",
    "Tell me about your AI experience and achievements.",
  ],
} satisfies Record<Exclude<AppMode, "arena">, string[]>;

export function ChatInterface({
  mode,
  messages,
  isLoading,
  onSend,
  onSpeak,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const title = mode === "ask" ? "How can I assist you today?" : "Talk to your AI avatar";
  const eyebrow = mode === "ask" ? "Hello, Sujal" : "Digital Twin Activated";
  const placeholder =
    mode === "ask"
      ? "Ask anything about AI, software, research, or your assignment..."
      : "Ask about Sujal's background, projects, goals, achievements, or style...";

  const suggestions = useMemo(() => presetPrompts[mode], [mode]);

  const submitMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="flex min-h-[620px] flex-1 flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="orb-core size-32 rounded-full" />
          <p className="text-gradient mt-8 text-3xl font-semibold">{eyebrow}</p>
          <h1 className="mt-2 max-w-3xl font-heading text-5xl leading-none text-foreground md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {mode === "ask"
              ? "Cortex combines a polished interface with a live OpenAI backend, so you can demo a real assistant instead of a toy chatbot."
              : "This mode is grounded by your local profile file so it can talk about your background, strengths, projects, and ambitions in your voice."}
          </p>
        </div>
      ) : (
        <ScrollArea className="subtle-scrollbar min-h-0 flex-1 pr-3">
          <div className="flex flex-col gap-4 pb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "assistant" ? "justify-start" : "justify-end",
                )}
              >
                {message.role === "assistant" ? (
                  <Avatar className="mt-1 size-10">
                    <AvatarFallback className="bg-primary/14 text-primary">CX</AvatarFallback>
                  </Avatar>
                ) : null}
                <div
                  className={cn(
                    "max-w-[84%] rounded-[28px] px-5 py-4 shadow-[0_18px_36px_rgba(123,87,184,0.08)]",
                    message.role === "assistant"
                      ? "bg-white/80 text-foreground"
                      : "bg-[#181818] text-white",
                  )}
                >
                  <p className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</p>
                  {message.role === "assistant" ? (
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full bg-white/80"
                        onClick={() => onSpeak(message.content)}
                      >
                        <Volume2 />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {isLoading ? (
              <div className="flex gap-3">
                <Avatar className="mt-1 size-10">
                  <AvatarFallback className="bg-primary/14 text-primary">CX</AvatarFallback>
                </Avatar>
                <div className="rounded-[28px] bg-white/82 px-5 py-4 text-sm text-muted-foreground shadow-[0_18px_36px_rgba(123,87,184,0.08)]">
                  Thinking through the response...
                </div>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      )}

      <div className="mt-auto rounded-[30px] bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <div className="rounded-[28px] border border-primary/8 bg-white/76 p-4">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            className="min-h-28 resize-none border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitMessage();
              }
            }}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="rounded-full bg-primary/6 text-primary hover:bg-primary/10"
                  onClick={() => {
                    if (!isLoading) {
                      onSend(suggestion);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Sparkles data-icon="inline-start" />
                  {suggestion}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full bg-white/80" disabled>
                <Mic />
              </Button>
              <Button
                className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
                onClick={submitMessage}
              >
                <SendHorizontal data-icon="inline-end" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

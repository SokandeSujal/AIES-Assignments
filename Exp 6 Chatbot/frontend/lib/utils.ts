import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatMode = "ask" | "avatar";

export type ChatResponse = {
  response: string;
};

export type ArenaResponse = {
  thinker: string;
  critic: string;
  judge: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

async function proxyRequest<T>(mode: "ask" | "avatar" | "arena", payload: object): Promise<T> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode, payload }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail ?? "Request failed.");
  }

  return data as T;
}

export function sendChatRequest(
  mode: ChatMode,
  message: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  return proxyRequest<ChatResponse>(mode, { message, history });
}

export function runArena(topic: string): Promise<ArenaResponse> {
  return proxyRequest<ArenaResponse>("arena", { topic });
}

export function createEmptyArena(): ArenaResponse {
  return {
    thinker: "",
    critic: "",
    judge: "",
  };
}

export function exportMessages(filename: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  const formatted = messages
    .map((message) => `${message.role.toUpperCase()}\n${message.content}`)
    .join("\n\n----------------------\n\n");

  const blob = new Blob([formatted], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

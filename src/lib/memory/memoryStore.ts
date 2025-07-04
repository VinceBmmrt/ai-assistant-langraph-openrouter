// lib/agentMemory.ts
import { BaseMessage } from "@langchain/core/messages";

type MemoryStore = Record<string, BaseMessage[]>;

const memory: MemoryStore = {};

export function getMessagesForThread(threadId: string): BaseMessage[] {
  return memory[threadId] || [];
}

export function saveMessagesForThread(
  threadId: string,
  messages: BaseMessage[]
): void {
  memory[threadId] = messages;
}

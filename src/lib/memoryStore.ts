import { BaseMessage } from "@langchain/core/messages";

// Stockage en mémoire par threadId
const threadMemory = new Map<string, BaseMessage[]>();

export function getMessagesForThread(threadId: string): BaseMessage[] {
  return threadMemory.get(threadId) || [];
}

export function saveMessagesForThread(
  threadId: string,
  messages: BaseMessage[]
): void {
  threadMemory.set(threadId, messages);
}

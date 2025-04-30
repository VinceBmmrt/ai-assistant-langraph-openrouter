// lib/agentMemory.ts
import { BaseMessage } from "@langchain/core/messages";
import fs from "fs";
import path from "path";

const MEMORY_FILE = path.join(process.cwd(), "agent-memory.json");

type MemoryStore = Record<string, BaseMessage[]>;

// Charger le fichier JSON s'il existe, sinon retourner un objet vide
function loadMemory(): MemoryStore {
  if (!fs.existsSync(MEMORY_FILE)) {
    return {};
  }
  const data = fs.readFileSync(MEMORY_FILE, "utf-8");
  return JSON.parse(data);
}

// Sauvegarder en JSON
function saveMemory(memory: MemoryStore) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), "utf-8");
}

// Récupérer les messages d'un thread
export function getMessagesForThread(threadId: string): BaseMessage[] {
  const memory = loadMemory();
  return memory[threadId] || [];
}

// Sauvegarder les messages d'un thread
export function saveMessagesForThread(
  threadId: string,
  messages: BaseMessage[]
): void {
  const memory = loadMemory();
  memory[threadId] = messages;
  saveMemory(memory);
}

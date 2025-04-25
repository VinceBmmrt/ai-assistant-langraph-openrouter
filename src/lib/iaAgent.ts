import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

import { NextResponse } from "next/server";
import { getMessagesForThread, saveMessagesForThread } from "./memoryStore";
import { AddCalendarEventTool } from "./tools/googleCalendarTool";
import { CheckAvailabilityTool } from "./tools/viewGoogleCalendarTool";

function getFormattedDateTime(offsetDays = 0, hour = 22) {
  const today = new Date();
  today.setDate(today.getDate() + offsetDays);
  today.setHours(hour, 0, 0, 0);
  return today.toISOString();
}

export async function chatWithAgent(
  message: string,
  threadId: string,
  accessToken: string
) {
  const addCalendarEventTool = new AddCalendarEventTool(accessToken);
  const checkAvailabilityTool = new CheckAvailabilityTool(accessToken);

  const agentTools = [addCalendarEventTool];

  const agentModel = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
    modelName: "openai/gpt-4.1-nano",
  });

  const agentCheckpointer = new MemorySaver();
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
  });

  let agentState;

  if (!accessToken) {
    console.error("Pas d'accessToken disponible");
    return NextResponse.json(
      { error: "Non autorisé (pas d'access token)" },
      { status: 401 }
    );
  }

  // Calcul des dates
  const todayDateTime = getFormattedDateTime(0);
  const tomorrowDateTime = getFormattedDateTime(1);
  const dayAfterTomorrowDateTime = getFormattedDateTime(2);

  // Message amélioré avec les dates calculées
  const enhancedMessage = `${message}\n\nAujourd'hui, nous sommes le ${todayDateTime}. Demain, c'est ${tomorrowDateTime} et après-demain, c'est ${dayAfterTomorrowDateTime}.`;

  const previousMessages = getMessagesForThread(threadId);

  // Ajoute le nouveau message
  const updatedMessages = [
    ...previousMessages,
    new HumanMessage(enhancedMessage),
  ];

  try {
    agentState = await agent.invoke(
      { messages: updatedMessages },
      { configurable: { thread_id: threadId } }
    );

    // ✅ Sauvegarde le nouvel historique (réponse incluse)
    if (agentState?.messages) {
      saveMessagesForThread(threadId, agentState.messages);
    }
  } catch (err) {
    console.error("🔴 Erreur spécifique dans agent.invoke:", err);
    throw err;
  }

  // Vérification de la structure des messages
  if (
    !agentState ||
    !agentState.messages ||
    !Array.isArray(agentState.messages)
  ) {
    throw new Error("La réponse de l'agent est mal formée ou vide");
  }

  const lastMessage = agentState.messages[agentState.messages.length - 1];
  console.log("Dernier message de l'agent:", lastMessage);

  return lastMessage.content;
}

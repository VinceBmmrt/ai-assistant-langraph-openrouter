import { chatWithAgent } from "@/lib/iaAgent";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const accessToken = token?.accessToken as string | undefined;

    if (!accessToken) {
      console.error("Pas d'accessToken disponible");
      return NextResponse.json(
        { error: "Non autorisé (pas d'access token)" },
        { status: 401 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Aucun message fourni." },
        { status: 400 }
      );
    }

    const agentResponse = await chatWithAgent(
      messages[messages.length - 1].content,
      "user-42",
      accessToken
    );

    if (!agentResponse) {
      throw new Error("Aucune réponse valide de l'IA");
    }

    return NextResponse.json({
      choices: [{ message: { content: agentResponse } }],
    });
  } catch (error) {
    console.error("Erreur dans l'API:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du message." },
      { status: 500 }
    );
  }
}

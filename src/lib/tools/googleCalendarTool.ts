import { Tool } from "@langchain/core/tools";

export class AddCalendarEventTool extends Tool {
  args = { query: { title: "summary", type: "string" } };

  name = "add_calendar_event";
  description = `
  Ajoute un événement dans le Google Calendar de l'utilisateur. 
  Appelle ce Tool lorsque l'utilisateur souhaite ajouter un événement dans son calendrier.
  Ajoute les informations supplémentaires si elles sont manquantes en t'inspirant du message utilisateur.
  
  ⚠️ Les dates doivent être au format ISO 8601 , Utilise le fuseau horaire de la France par défaut.
  Exemple de format : "2025-04-27T09:00:00-07:00".
  
  Exemple 1 :
  {
    "summary": "Réunion de projet",
    "description": "Discussion sur le projet X",
    "start": "2025-04-27T09:00:00-07:00",
    "end": "2025-04-27T10:00:00-07:00"
  }
  
  Exemple 2 :
  {
    "summary": "Rendez-vous médical",
    "description": "Consultation avec le docteur Y",
    "start": "2025-05-01T14:00:00+02:00",
    "end": "2025-05-01T14:30:00+02:00"
  }
  `;

  googleToken: string;
  constructor(googleToken: string) {
    super();
    this.googleToken = googleToken;
  }

  async checkBusy(input: string): Promise<string> {
    try {
      const { start, end } = JSON.parse(input);

      console.log("🚀 ~ end:", end);
      console.log("🚀 ~ start:", start);
      console.log("🚀 ~ googleToken:", this.googleToken);

      if (!this.googleToken) {
        throw new Error(
          "Token d'accès non disponible. Veuillez fournir un accessToken."
        );
      }

      const requestBody = {
        timeMin: start,
        timeMax: end,
        timeZone: "UTC", // Le fuseau horaire de la réponse, tu peux le modifier si nécessaire
        items: [
          { id: "primary" }, // Utilise "primary" pour l'agenda principal de l'utilisateur
        ],
      };

      // Envoi de la requête POST à l'API Google Calendar
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/freeBusy",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.googleToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur Google API:", errorText);
        throw new Error(
          `Erreur lors de la vérification de la disponibilité: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Réponse de l'API:", data);

      // Vérifie s'il y a des périodes occupées dans la réponse
      const busyPeriods = data.calendars.primary?.busy;

      if (busyPeriods && busyPeriods.length > 0) {
        throw new Error(
          "Le créneau horaire est déjà occupé par un ou plusieurs événements."
        );
      } else {
        return "Le créneau horaire est disponible.";
      }
    } catch (error: any) {
      console.error("Erreur dans _call:", error);
      throw new Error(
        error.message || "Erreur lors de la vérification de la disponibilité."
      );
    }
  }

  async _call(input: string): Promise<string> {
    const inputFormated = input.replaceAll("'", '"');
    console.log("🚀 ~ inputFormated:", inputFormated);
    try {
      const { summary, description, start, end } = JSON.parse(inputFormated);
      await this.checkBusy(input);
      if (!this.googleToken) {
        return "Token d'accès non disponible. Veuillez fournir un accessToken.";
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.googleToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: summary,
            description: description,
            start: { dateTime: `${start}` },
            end: { dateTime: `${end}` },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur Google API:", errorText);
        return `Erreur lors de l'ajout de l'événement: ${errorText}`;
      }

      const data = await response.json();
      return `Événement ajouté: ${data.summary}`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erreur dans _call:", {
          message: error.message,
          stack: error.stack,
          rawError: error,
        });
        return `Erreur lors de l'ajout de l'événement: ${error.message}`;
      } else {
        console.error("Erreur inconnue dans _call:", error);
        return `Erreur lors de l'ajout de l'événement: ${error}`;
      }
    }
  }
}

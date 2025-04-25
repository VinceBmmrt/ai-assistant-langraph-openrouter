import { Tool } from "@langchain/core/tools";

export class CheckAvailabilityTool extends Tool {
  args = { query: { start: "start", end: "end" } };
  name = "check_availability";
  description = `
    Vérifie la disponibilité d'un créneau horaire dans le Google Calendar de l'utilisateur.
    Le créneau est considéré comme occupé si un événement existe durant cette période.

  

    input = {"start": "2025-04-30T12:00:00+02:00", "end": "2025-04-30T13:00:00+02:00"}
  `;

  googleToken: string;

  constructor(googleToken: string) {
    super();
    this.googleToken = googleToken;
  }

  async _call(input: string): Promise<string> {
    console.log("🚀 ~ input:", input);

    try {
      const { start, end } = JSON.parse(input);

      if (!this.googleToken) {
        return "Token d'accès non disponible. Veuillez fournir un accessToken.";
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
        return `Erreur lors de la vérification de la disponibilité: ${errorText}`;
      }

      const data = await response.json();
      console.log("Réponse de l'API:", data);

      // Vérifie s'il y a des périodes occupées dans la réponse
      const busyPeriods = data.calendars.primary?.busy;

      if (busyPeriods && busyPeriods.length > 0) {
        return "Le créneau horaire est déjà occupé par un ou plusieurs événements.";
      } else {
        return "Le créneau horaire est disponible.";
      }
    } catch (error) {
      console.error("Erreur dans _call:", error);
      return "Erreur lors de la vérification de la disponibilité.";
    }
  }
}

import { CheckAvailabilityTool } from "@/lib/tools/viewGoogleCalendarTool";

// Remplace ceci par un Google Access Token valide
const googleToken =
  "ya29.a0AZYkNZjt1A4AKa1yMrWufIF9SDWQ3f-UYPy6tTmCuBiBBVBMcgQUhP0wS3C4GJGY8O0Hb9Em9aDwjpGwrTx_WsqR6NauaQybdYLioL93MnM9Vlun-dBZtkAGxz2N8N3KuSkXD0PAdmk3ET99Eq3hCKjNgBY2-AHPTrsCTAG5aCgYKAbUSARYSFQHGX2Miz-DE2Jnq3uXv3WV3vDe-kg0175";

const checkAvailabilityTool = new CheckAvailabilityTool(googleToken);

// Exemple de créneau horaire à tester
const input = JSON.stringify({
  start: "2025-04-30T12:00:00+02:00",
  end: "2025-04-30T13:00:00+02:00",
});

export async function testAvailability() {
  try {
    const result = await checkAvailabilityTool._call(input);
    console.log("Résultat:", result); // Affiche le résultat de la disponibilité
  } catch (error) {
    console.error("Erreur lors du test de la disponibilité:", error);
  }
}

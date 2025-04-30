# 🧠 AI Calendar Assistant

Ce projet est un assistant IA personnel qui interagit avec les utilisateurs via une interface simple, tout en étant capable d'accéder au Google Calendar de l'utilisateur pour :

- Ajouter des événements intelligemment selon la disponibilité
- Vérifier les créneaux libres
- Garder en mémoire les échanges grâce à un historique persistant

L'IA repose sur [Langraph](https://langraph.com) avec un agent utilisant [OpenRouter](https://openrouter.ai) (GPT-4, Mixtral…), et l'authentification passe par [NextAuth.js](https://next-auth.js.org/) avec OAuth Google.

## ✨ Fonctionnalités

- 🔐 Authentification Google OAuth avec NextAuth
- 📅 Ajout intelligent d'événements via l'API Google Calendar
- ✅ Vérification de disponibilité dans le calendrier
- 🧠 Agent IA basé sur Langraph + OpenRouter (GPT-4 / Mixtral)
- 💾 Stockage JSON persistant des conversations utilisateur
- ⚡ Interface Next.js rapide et moderne

## ⚙️ Étapes pour lancer le projet en local

1. **Cloner le dépôt**


2. **Installer les dépendances**

   ```bash
   pnpm install
   ```
   
   Assure-toi d'avoir `pnpm` installé (`npm install -g pnpm` si besoin).

3. **Configurer les variables d'environnement**

 fichier `.env.` à la racine du projet :

   ```

GOOGLE_CLIENT_ID=clientID_google
GOOGLE_CLIENT_SECRET=client_secret_google
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
OPENROUTER_API_KEY=openrouter_key
NEXTAUTH_SECRET=secret_next_auth
   ```

4. **Lancer le serveur de développement**

   ```bash
   pnpm dev ou npm run dev
   ```
   
   Puis ouvre http://localhost:3000 dans ton navigateur.

   5. **Se connecter via google pour accorder les permissions d'accéder à google calendar**

   - Sélectionner son compte google
   - Qaand l'écran Google n'a pas validé cette application cliquer sur "paramètres avancés" puis  "Accéder à IA_Assistant "
   -Accepter les règles de confidentialité pour donner les droits d'inscrire dans le calendrier


      5. **Se connecter via google pour accorder les permissions d'accéder à google calendar**

      ✅ Exemples de prompt

      "Ajoute un rendez-vous avec Tennis avec Paul demain à 14h"

      L'évènement s'ajoute dans le google calendar , redéclencher le même prompt et l'agent détecte qu'il y a déjà un événement prévu à ce créneau horaire. 

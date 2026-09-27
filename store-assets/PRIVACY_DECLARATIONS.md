# Déclarations de confidentialité à reporter dans les consoles

Ce document prépare les réponses. La validation finale doit être faite par le titulaire des comptes Apple et Google.

## Données collectées

| Catégorie | Données | Finalité | Liées à l’identité | Suivi publicitaire |
| --- | --- | --- | --- | --- |
| Coordonnées | Adresse e-mail | Gestion du compte, sécurité, récupération | Oui | Non |
| Informations personnelles | Nom d’affichage facultatif | Personnalisation du profil | Oui | Non |
| Activité dans l’application | Progression, exercices, dernière activité | Fonctionnement et synchronisation | Oui si connecté | Non |
| Identifiants techniques | Abonnement push et jetons de session | Connexion, sécurité, notifications demandées | Oui | Non |
| Mesure d’audience | Pages vues agrégées via Vercel Web Analytics (sans cookie, sans suivi inter-sites) | Statistiques de fréquentation | Non | Non |
| Diagnostics techniques | Journaux minimaux d’erreur et de sécurité des hébergeurs | Sécurité et fiabilité | Potentiellement | Non |

## Déclarations générales

- Aucune publicité comportementale.
- Aucun courtier en données.
- Aucun suivi inter-applications ou inter-sites.
- Données chiffrées pendant le transport avec HTTPS.
- Mot de passe stocké uniquement sous forme de hachage.
- Suppression disponible dans l’application et sur le web.
- Compte facultatif : le mode invité reste utilisable.
- Microphone utilisé uniquement pendant un exercice de prononciation déclenché par l’utilisateur.
- Reconnaissance vocale effectuée par le service du navigateur ou du système (Apple / Google) ; l’audio n’est ni reçu ni stocké par Al-Kareem : ne pas déclarer « Audio Data » comme collectée par l’app.
- Android : l’application déclare `RECORD_AUDIO` et la visibilité du service `android.speech.RecognitionService` (aucun autre accès).

## Google Play — Data safety

- Cocher « collecte de données » pour e-mail, nom facultatif, activité/progression et identifiants techniques.
- Indiquer les finalités : fonctionnalités de l’application, gestion du compte, sécurité et communications demandées.
- Déclarer que les données ne sont pas vendues et ne servent pas à la publicité.
- Fournir `https://al-kareem.app/privacy` et `https://al-kareem.app/account-deletion`.

## Apple — App Privacy

- Contact Info → Email Address : App Functionality / Account Management, linked to user.
- User Content ou Other User Content : ne pas sélectionner sauf ajout futur d’un contenu libre par l’utilisateur.
- Usage Data → Product Interaction : App Functionality, linked when signed in.
- Identifiers → User ID : App Functionality / Account Management, linked to user.
- Diagnostics : sélectionner uniquement si la configuration Vercel effectivement utilisée transmet des diagnostics identifiables.
- Usage Data → Product Interaction couvre aussi la mesure d’audience agrégée Vercel Web Analytics (non liée, sans suivi).
- Tracking : Non.

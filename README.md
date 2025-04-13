# ChronoMontagne

Une application web pour comparer vos temps de course en montagne avec vos amis en temps réel.

## Fonctionnalités

- Enregistrer vos chronos pour différentes courses de montagne
- Ajouter de nouvelles courses avec distance et dénivelé
- Définir des tracés sur une carte avec OpenStreetMap et Leaflet
- Chronomètre GPS automatique qui démarre et s'arrête selon votre position
- Visualiser les classements par course
- Partage des données en temps réel entre tous les utilisateurs
- Interface intuitive et responsive

## Comment utiliser l'application

1. Démarrez le serveur backend : `cd backend && npm run dev`
2. Ouvrez le fichier `frontend/index.html` dans votre navigateur
3. Utilisez l'onglet "Définir un tracé" pour créer un parcours sur la carte
4. Utilisez l'onglet "Ajouter une course" pour créer de nouvelles courses avec le tracé défini
5. Utilisez l'onglet "Chronomètre GPS" pour enregistrer automatiquement vos temps lors de vos courses
6. Utilisez l'onglet "Ajouter un chrono" pour enregistrer manuellement vos temps
7. Consultez les classements dans l'onglet "Classements"

## Structure du projet

- `frontend/` - Contient tous les fichiers de l'interface utilisateur
  - `index.html` - Page principale de l'application
  - `styles.css` - Styles CSS pour l'interface
  - `app.js` - Code JavaScript/React de l'application
  - `map.js` - Fonctions pour la gestion des cartes avec Leaflet
  - `api.js` - Fonctions pour communiquer avec le backend
- `backend/` - Serveur Node.js avec Express et MongoDB
  - `server.js` - Point d'entrée du serveur
  - `models/` - Modèles de données Mongoose
  - `routes/` - Routes API Express

## Déploiement

Cette application utilise Node.js, Express et MongoDB côté serveur, et HTML, CSS et JavaScript côté client.

### Prérequis
- Node.js et npm installés
- Accès à une base de données MongoDB (locale ou MongoDB Atlas)

### Installation
1. Clonez ce repository
2. Installez les dépendances du backend : `cd backend && npm install`
3. Configurez les variables d'environnement dans le fichier `.env` :
   ```
   PORT=5001
   MONGO_URI=votre_url_de_connexion_mongodb
   ```
4. Démarrez le serveur : `npm run dev`
5. Ouvrez `frontend/index.html` dans votre navigateur

## Développement futur

Fonctionnalités qui pourraient être ajoutées :
- Authentification utilisateur
- Graphiques de progression
- Statistiques avancées
- Partage sur les réseaux sociaux
- Application mobile
- Intégration avec des montres connectées et trackers GPS
- Prédictions de temps basées sur les performances passées

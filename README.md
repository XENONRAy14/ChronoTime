# ChronoTime 04 — Touge Timing System

Application de chronométrage GPS pour **parcours privés autorisés** : comptes, création de parcours, sessions automatiques, classements, performances personnelles et administration. Interface française inspirée du touge japonais : graphite, rouge compétition, typographie de cockpit et illustration nocturne originale.

## Démarrer

Prérequis : Node.js 20+, npm et une base MongoDB accessible. L’archive contient déjà `frontend/dist` compilé.

```bash
npm run setup
cp .env.example .env
# Renseigner MONGO_URI et JWT_SECRET dans .env.
npm start
```

Ouvrir http://localhost:9000. Ne pas ouvrir `frontend/index.html` directement : c’est le point d’entrée du build. Enregistrer un compte depuis l’interface. Sans MongoDB, la connexion affiche une erreur explicite ; aucune donnée fictive n’est ajoutée.

Pour générer le secret :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Le fichier `.env` est toujours lu à la racine. En développement, l’absence de secret produit une clé aléatoire temporaire. En production, un secret d’au moins 32 caractères est obligatoire. Ne jamais réutiliser une clé d’exemple.

## Modifier et vérifier

```bash
npm run build
npm test
npm run test:integration
```

- `build` compile React et Leaflet localement avec esbuild. Aucun Babel ni React chargé depuis un CDN à l’exécution.
- `test` : 18 tests du moteur GPS, de l’interface simulée avec JSDOM, des erreurs API et de la sécurité HTTP. Ils utilisent des données de test isolées.
- `test:integration` : cycle avec une vraie instance MongoDB éphémère (téléchargement du binaire au premier lancement). Le test est fourni, mais son exécution n’a pas abouti dans l’environnement d’audit : MongoDB refuse de démarrer avec `open: Operation not permitted`. Ce test échoue explicitement si MongoDB ne démarre pas ; il n’est pas présenté comme réussi.

Après toute modification du frontend, relancer le build avant les tests et le serveur. Les tests de sécurité servent réellement les fichiers compilés avec Express.

## Parcours d’utilisation

1. Se connecter : le garage montre les données réellement enregistrées.
2. Ouvrir Route Studio. Rechercher un lieu ou déplacer la carte.
3. Cliquer dans l’ordre : départ, passages intermédiaires, arrivée. Glisser les balises pour corriger. Le premier et le dernier point définissent les limites de session.
4. Configurer le parcours : nom, distance préremplie, dénivelé réel à renseigner. Zéro mètre de dénivelé est accepté.
5. Choisir le parcours dans Session GPS et armer le chronomètre à l’arrêt.
6. Un point GPS précis à 35 m ou mieux, dans les 25 m du départ, démarre la session. Il faut quitter la zone de départ et franchir les autres balises dans l’ordre. L’arrivée termine la session.
7. Si l’envoi échoue, le chrono est conservé sur cet appareil, par compte. « Réessayer la sauvegarde » renvoie le même identifiant de session pour éviter les doublons. Ne pas effacer le stockage navigateur avant synchronisation.

**Précision réelle** : les millisecondes affichées ne constituent pas une certification de précision. Le GPS du téléphone, la fréquence des positions et la mise en arrière-plan influencent la mesure. Garder la page visible ; un navigateur mobile peut suspendre le GPS écran verrouillé. Les balises ne sont pas des lignes de passage homologuées. Une session interrompue n’est pas reprise automatiquement.

## Administration

Créer un compte, puis exécuter sur le serveur :

```bash
node backend/scripts/set-admin.js votre_pseudo
```

Se reconnecter ou recharger l’application. La création de parcours nécessite un compte. La modification et la suppression exigent le rôle administrateur. Un parcours contenant des chronos est protégé contre la modification et la suppression. Les actions administrateur sont contrôlées côté serveur ; masquer un bouton n’est pas une mesure de sécurité.

## Hébergement

Déploiement recommandé : Node/Express sert simultanément `frontend/dist` et `/api`. Utiliser HTTPS pour le GPS sur téléphone, `NODE_ENV=production`, un secret robuste et un compte MongoDB limité à cette application.

Si un reverse proxy termine TLS, ajouter l’origine publique exacte dans `ALLOWED_ORIGINS`, par exemple `https://chrono.votre-domaine.fr`. Ne pas activer aveuglément la confiance de tous les proxies.

Un hébergement séparé du frontend reste possible avec les fichiers Netlify fournis. Définir explicitement `window.CHRONOTIME_API_URL` dans `frontend/runtime-config.js`, ajouter cette origine frontend dans `ALLOWED_ORIGINS` côté serveur, puis reconstruire. L’ancien endpoint Render n’est plus appelé implicitement. Un déploiement statique seul ne fournit pas MongoDB ni l’authentification.

## Structure

- `frontend/app.js` : composants React et navigation.
- `frontend/timing.js` : moteur GPS déterministe.
- `frontend/map.js` : Leaflet partagé desktop/mobile et routage OSRM.
- `frontend/api.js` : client API avec timeout et gestion d’expiration.
- `frontend/theme.css` : identité visuelle et responsive.
- `backend/` : Express, modèles MongoDB, contrôle d’accès et validation.
- `AUDIT.md` : constats, corrections, preuves et limites restantes.
- `verification/` : résultats des tests et audits de dépendances.
- `legacy/` : anciens scripts et textes historiques conservés pour référence, non publiés par Express. Ils ne décrivent pas la version 04.

Cartographie externe : tuiles OpenStreetMap, recherche Nominatim et routage OSRM. Les requêtes de carte/recherche/routage contactent ces services. Aucun suivi GPS permanent n’est envoyé ; seules les statistiques et le chrono sont enregistrés à la fin d’une session. Les anciens workers sont retirés via `sw.js`; aucune disponibilité hors ligne complète n’est promise.

# Audit et refonte ChronoTime 04

Date : 9 septembre 2026. Source : archive `ChronoTime-main.zip` fournie. Aucune connexion à une base ou un service de production existant ; aucune donnée utilisateur modifiée.

## Ce que fait réellement le produit

ChronoTime est un MVP de chronométrage communautaire GPS. Un utilisateur crée un compte, dessine un parcours sur carte, prépare une session, déclenche automatiquement son chrono par proximité GPS et compare ses résultats à ceux des autres participants. Le produit comprend un espace personnel et une administration. Les parcours sont partagés dans la base de l’application.

La pile est React côté interface, Leaflet/OpenStreetMap pour la carte, OSRM pour les itinéraires routiers, Express/Node côté API, Mongoose/MongoDB pour la persistance et JWT/bcrypt pour les comptes.

L’ancienne documentation décrivait du trail ; le moteur de routage utilisait déjà `driving` et l’habillage évoquait Initial D. La version 04 assume une identité touge automobile, avec l’usage sur parcours privé déjà prévu dans le projet. Elle ne se présente pas comme un service de chronométrage homologué.

Ce n’est pas encore un SaaS commercial complet : pas d’abonnement, de facturation, de récupération de mot de passe, d’équipes isolées, de supervision ou de politique de sauvegarde automatisée. Ces éléments ne sont pas inventés dans l’interface.

## Résultat visuel et UX

La DA rouge/noir est conservée, avec une exécution plus structurée : graphite, blanc cassé pour les éléments actifs, rouge compétition pour l’action principale. Une illustration nocturne originale est intégrée localement et compressée en WebP. Elle ne dépend plus d’un site de fonds d’écran.

- **Accès pilote** : composition en deux panneaux, identité japonaise, formulaire lisible et labels associés aux champs.
- **Garage** : données réelles du compte, compteurs, parcours accessibles directement et dernières sessions. Aucun faux record affiché.
- **Session GPS** : chrono dominant, précision, vitesse, distance restante, état du suivi, carte et action principale cohérente avec la session.
- **Route Studio** : clic pour placer une balise, glisser pour ajuster, annuler le dernier point, effacer, rechercher un lieu et configurer le parcours.
- **Classements** : recherche par parcours et choix entre tous les essais ou le meilleur essai par pilote.
- **Performances** : historique personnel fondé sur l’identifiant utilisateur, avec distance, durée et statistiques.
- **Responsive** : navigation latérale desktop, navigation horizontale mobile, cockpit en une colonne sur petits écrans, tables défilantes.
- **Accessibilité** : focus visible, lien d’évitement, labels, erreurs annoncées, état actif de navigation, mouvement réduit, contrôles de taille tactile.

La mise en page responsive est implémentée mais n’a pas fait l’objet d’une inspection visuelle dans un vrai navigateur. Les tests JSDOM ne mesurent pas le rendu CSS.

## Constats et corrections

| Priorité | Constat dans l’archive | Correction livrée |
|---|---|---|
| Critique | Création, modification et suppression de parcours sans authentification | Création réservée aux comptes ; modification et suppression réservées aux administrateurs |
| Critique | Secret JWT public utilisé par défaut | Secret aléatoire temporaire en développement ; refus des secrets absents, trop courts ou d’exemple en production |
| Haute | Hash de mot de passe potentiellement renvoyé après promotion/rétrogradation | Transformation JSON du modèle User supprimant systématiquement `password` |
| Haute | Identifiants de connexion pouvant recevoir des objets plutôt que des chaînes | Validation des types, longueurs, pseudo, email et mot de passe avant les requêtes |
| Haute | Suppression administrateur pouvant viser son propre compte ou un autre admin directement | Autodestruction et autorétrogradation bloquées ; rétrogradation préalable exigée pour supprimer un autre admin |
| Haute | Huit dépendances de production signalées, dont cinq à sévérité haute | Correctifs compatibles du lockfile et override `qs >= 6.16.0` ; aucun avis détecté par l’audit final de production |
| Haute | Sauvegarde échouée transformée en faux succès local | État d’erreur explicite, conservation locale par compte, action de renvoi, succès seulement après réponse serveur |
| Haute | Risque de doubles chronos après réponse réseau perdue | Identifiant client de session conservé et index unique partiel utilisateur/session ; retour de l’enregistrement existant |
| Haute | Chronos avec parcours inexistant, durée invalide ou statistiques non finies | Validation des références, format de durée, durée positive et statistiques |
| Haute | Arrivée pouvant terminer immédiatement une session près du départ | Sortie de la zone de départ obligatoire, durée minimale et balises franchies dans l’ordre |
| Haute | Coordonnées zéro rejetées ; grande imprécision élargissant les balises jusqu’à 300 m | Calcul indépendant de Leaflet acceptant zéro ; rejet des positions imprécises au-delà de 35 m ; rayon fixe de 25 m |
| Haute | Suivi GPS et timers pouvant survivre à la navigation | Nettoyage au démontage, à l’erreur et à l’arrêt ; traitement correct d’un watch ID égal à zéro ; confirmation de sortie pendant la session |
| Haute | API distante historique appelée implicitement | API de même origine par défaut ; URL externe uniquement sur configuration explicite |
| Haute | Erreurs serveur avalées en listes vides | Propagation des erreurs, état visible et relance manuelle ; délai maximal de requête |
| Haute | « Mode hors ligne » annoncé côté serveur sans routes adaptées | Suppression du fallback trompeur ; `/api/health` et API renvoient 503 si MongoDB est indisponible |
| Moyenne | Carte mobile remplacée par un iframe incompatible avec les contrôles React | Implémentation Leaflet unique pour mobile et desktop |
| Moyenne | Anciennes réponses OSRM pouvant remplacer le nouveau tracé | Annulation des requêtes et contrôle de révision avant application |
| Moyenne | Distance préaffichée mais absente du formulaire de création | Initialisation effective du champ depuis le tracé ; dénivelé nul accepté |
| Moyenne | Dénivelé simulé aléatoirement dans un utilitaire ancien | Aucun dénivelé inventé ; saisie explicite dans le parcours |
| Moyenne | `vitesseMaximum` envoyé alors que le modèle attend `vitesseMax` | Nom du champ aligné et testé dans le scénario de sauvegarde |
| Moyenne | Chrono fraîchement peuplé associé à un objet Course plutôt qu’à son identifiant | Normalisation commune des chronos à la lecture et après sauvegarde |
| Moyenne | Listes non vidées lorsque le serveur renvoie un tableau vide | Remplacement explicite des collections, y compris vides |
| Moyenne | Chronos personnels attribués par nom, susceptible de collision | Appartenance vérifiée via `userId` |
| Moyenne | Tri lexical des temps côté endpoint parcours | Tri numérique, compatible avec plusieurs heures et millisecondes |
| Moyenne | CORS permissif même pour les origines hors liste | Rejet des origines non autorisées, liste configurable et `Vary: Origin` |
| Moyenne | Modification/suppression d’un parcours invalidant les résultats existants | Blocage si des chronos sont rattachés ; création d’un nouveau parcours requise |
| Moyenne | Compilation Babel et React depuis des CDN à chaque ouverture | Bundle de production local, dépendances verrouillées, build reproductible |
| Moyenne | Manifest pointant vers des captures et raccourcis inexistants | Références invalides retirées ; orientation libre et identité mise à jour |
| Moyenne | Empilement de scripts et styles historiques | Sources historiques déplacées dans `legacy/`, non exposées par le serveur de production |

## Vérifications exécutées

**Build de production réussi. 18 tests automatisés réussis.** Les sorties complètes sont dans `verification/`.

- Moteur GPS : coordonnées zéro, formats de temps, position imprécise, ordre des balises, départ/arrivée confondus.
- Interface JSDOM : écran de connexion et inscription, navigation garage/classements/performances/GPS, déconnexion, erreurs API visibles, création bloquée sans tracé.
- Session simulée : armer, démarrer, terminer, libérer le GPS même avec un identifiant nul, simuler un échec serveur, conserver le chrono, retenter puis vérifier sa présence dans les performances.
- Tracé : fin de calcul effaçant explicitement l’état d’attente.
- API Express réelle, sans base : en-têtes, CORS, santé, 503, contrôle d’accès avant modèles, validation d’identifiants, route inconnue et fichiers compilés.
- Modèles/validation : mots de passe absents de la sérialisation, rejet de données invalides, démarrage production bloqué pour un secret d’exemple.
- Dépendances : `npm audit --omit=dev` indique **0 vulnérabilité connue** pour les deux applications au moment du contrôle. Cela ne certifie pas l’absence de vulnérabilité dans le code.

**Test d’intégration MongoDB non abouti.** Le binaire MongoDB éphémère a été téléchargé, mais son processus quitte au démarrage avec `open: Operation not permitted`. Le cycle inscription → connexion → parcours → chrono → renvoi idempotent → suppression est fourni dans `backend/tests/database.integration.js`. Il doit être exécuté sur un environnement où MongoDB démarre. Aucun accès à une base de production n’a été utilisé.

**Non vérifiés ici** : rendu dans un navigateur réel, Safari/iOS, Android, GPS physique, écran verrouillé, latence réelle des balises, services cartographiques en conditions réelles, transactions MongoDB, migrations de données existantes et charge concurrente. La version n’est donc pas déclarée « 100 % fonctionnelle en production ».

## Points restant à traiter avant une ouverture commerciale

1. **Valider sur appareil réel et base de préproduction** : scénario complet, refus GPS, perte de signal, passage rapide des balises, écran verrouillé, réseau coupé puis rétabli. La réception GPS peut manquer une balise ; l’algorithme actuel utilise une zone, sans interpolation de franchissement de ligne.
2. **Fiabilité des classements** : les durées restent des déclarations de clients authentifiés. L’idempotence empêche certains doublons, pas la falsification. Une compétition officielle nécessiterait une conception anti-triche et une source de temps adaptée.
3. **Intégrité sous concurrence** : index de session à créer et vérifier en déploiement ; opérations administratives multiples non transactionnelles ; contrôle de références de parcours non transactionnel. Prévoir transactions et journal d’audit pour un déploiement multiutilisateur exigeant.
4. **Comptes** : récupération de mot de passe, vérification email, révocation des sessions et éventuellement cookies HttpOnly. Les JWT sont encore stockés dans le navigateur, donc une faille XSS pourrait les exposer.
5. **Confidentialité** : parcours et classements sont publics via leurs endpoints de lecture, comme auparavant. Des anciens chronos peuvent encore contenir le nom complet ; les nouveaux utilisent le pseudo. Prévoir contrôle de visibilité, migration éventuelle, suppression/export de compte et textes adaptés au fonctionnement réel. Les textes historiques ne sont pas une validation juridique.
6. **Exploitation et volume** : sauvegardes/restauration, alertes, pagination, quotas de création, limitation distribuée des tentatives et configuration du proxy. Les listes sont actuellement chargées intégralement et le rate limiter est en mémoire par processus.
7. **Cartographie** : services publics tiers sans garantie de disponibilité dans ce projet. Le mode dégradé affiche une distance à vol d’oiseau ; le pilote doit vérifier la distance du parcours. Pas d’élévation automatique ni de mode hors ligne intégral.

## Prochaines initiatives à forte valeur

- Comparaison de deux sessions sur le **même** parcours, avec écarts par secteur persistés.
- Garage véhicule : modèle, pneus et configuration associés à la session, pour comparer ce qui est comparable.
- Clubs privés et événements, avec validation organisateur des parcours et résultats.
- Export de sessions et journal de progression ; passage éventuel à un capteur GPS externe après validation technique.

Ces idées sont une suite possible. Aucun bouton ne prétend les fournir dans cette version.

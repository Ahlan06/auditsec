Décision de déploiement — frontend
=================================

Date: 2025-12-14

Résumé
------
- Conflit de peer-dependencies pendant npm install sur Vercel causé par des paquets 3D (drei / fiber) demandant React ^19 alors que le projet utilise React 18.
- Pour permettre un déploiement stable sans migration majeure, les dépendances 3D ont été retirées du `package.json` et le fond 3D a été remplacé par un rendu canvas léger (`CyberBackground.jsx`).
- Le build de production (`vite build`) fonctionne localement avec la configuration actuelle (Vite v5.x).

Vulnérabilités
--------------
- `npm audit` a détecté 3 vulnérabilités modérées liées à esbuild/vite.
- La correction complète nécessite une mise à jour majeure de Vite (vers v7), potentiellement breaking.

Décision prise
---------------
- Option choisie: reporter la mise à jour majeure et conserver Vite v5 pour le moment (risque accepté).

Plan d'action recommandé
------------------------
1) Créer une branche `chore/upgrade-vite` pour tester la migration vers Vite 7 et mettre à jour les plugins.
2) Tester et corriger les erreurs de build sur la branche avant de merger.
3) Après validation, appliquer `npm audit fix --force` puis redéployer.
4) Ajouter un contrôle CI (build + lint) pour éviter les merges cassants.

Surveillance
------------
- Paramètres Vercel à vérifier: Root Directory = frontend, Build Command = npm run build, Output = dist.
- Si le déploiement échoue en ERESOLVE, copier les logs et m'envoyer l'erreur complète.

Commandes utiles (exécuter depuis `frontend`)
- npm install
- npm run build
- npm audit --json > audit-results.json
- git checkout -b chore/upgrade-vite
- npm install vite@7 @vitejs/plugin-react@latest
- npm run build

Notes finales
-------------
- Décision priorisant la stabilité immédiate. Planifier la migration Vite 7 sur une branche dédiée.

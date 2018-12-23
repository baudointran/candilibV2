# Candilib

Code source de l'application de réservation en ligne de places à l'examen pratique du permis de conduire. Ce service public est à destination des usagers [inscrits sur le système de l'ANTS](https://permisdeconduire.ants.gouv.fr/Services-associes/Effectuer-une-demande-de-permis-de-conduire-en-ligne) et ayant réussi l'épreuve pratique du code de la route.

## Utilisation

### Dev

#### Lancer le conteneur de la base de données (mongodb)

```bash
cd server
docker-compose -f docker-compose.dev.db.yml up
```

#### Lancer les tests côté serveur

```bash
cd server
npm test
```

#### Lancer les tests côté serveur en mode surveillance

```bash
cd server
npm test:watch
```

#### Lancer le serveur en mode dev

Le serveur sera rechargé à chaque modification du code serveur
(toute modification dans `server/src`)

```bash
cd server
npm install
npm run dev
```

### Déploiement

Transpiler les ESM et lancer le serveur en mode production

```bash
cd server
npm install
npm start
```

C'est le répertoire `dist` qui contient l'application. C'est le fichier `index.js` dans
ce répertoire qu'il faudra lancer en production.

## TODO

- Démarrage en prod avec pm2
- Gestion des jwt
- Définition des routes
- Écriture de tests unitaires
- Structure des données mongo
- Client Front-office (FO)
- Client Back-office (BO)
- Définition des conteneurs db.prod, back, client-fo, client-bo
- Définition des docker-compose
- Liaison avec Travis et le Jenkins interne

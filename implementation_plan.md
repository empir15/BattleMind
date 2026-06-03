# 🧠 BattleMind — Plan d'Implémentation Final

## Contexte du projet

**BattleMind** est un jeu de réflexion multijoueur par équipes sur réseau local (LAN).
- Plateforme cible MVP : **Android uniquement**
- Mode réseau MVP : **Socket.IO LAN** — Serveur sur PC, clients sur téléphones Android
- Architecture : **Client / Serveur classique**

---

## Stack Technique

### 🖥️ Serveur (`server/`)
| Technologie | Rôle |
|---|---|
| Node.js + Express | Serveur HTTP |
| Socket.IO (serveur) | Communication temps réel LAN |
| SQLite (`better-sqlite3`) | Questions officielles + état de jeu |
| TypeScript | Code typé strict |
| `uuid` | Génération d'identifiants uniques joueurs |
| `winston` | Système de logs structurés |

### 📱 Mobile (`mobile/`)
| Technologie | Rôle |
|---|---|
| React Native CLI + TypeScript strict | Framework mobile Android |
| React Navigation (Stack + Bottom Tabs) | Navigation entre écrans |
| Zustand | État global UI |
| Socket.IO Client | Connexion au serveur Node.js |
| React Native MMKV | Préférences utilisateur locales (IP, pseudo) |
| React Native Paper | Composants UI Material |
| React Native Reanimated | Animations fluides |
| React Native Gesture Handler | Gestes tactiles |

### 📦 Partagé (`shared/`)
| Fichier | Rôle |
|---|---|
| `game.types.ts` | Types TypeScript communs (Player, Team, Match…) |
| `socket.types.ts` | Événements Socket.IO typés |
| `constants.ts` | Constantes du jeu (timers, vies, équipes…) |

---

## 🏗️ Architecture Globale

### Principe fondamental

> **Toute la logique métier s'exécute côté serveur.**
> Les clients React Native **affichent uniquement** l'état reçu du serveur.
> Les clients ne calculent jamais : vainqueurs, vies, scores, chronomètres, validations.

### Flux réseau

```
                    ┌──────────────────┐
                    │  Node.js Server  │
                    │  PC sur réseau   │
                    │  Port 3000 LAN   │
                    │                  │
                    │  • Logique métier│
                    │  • Chronomètres  │
                    │  • Vies & scores │
                    │  • SQLite        │
                    │  • Validation    │
                    └────────┬─────────┘
                             │
                      Réseau Wi-Fi LAN
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────┴──────┐   ┌───────┴──────┐   ┌───────┴──────┐
   │    Juge     │   │  Joueur 1    │   │  Joueur 2    │
   │React Native │   │React Native  │   │React Native  │
   │   Client    │   │   Client     │   │   Client     │
   │(admin perms)│   │              │   │              │
   └─────────────┘   └──────────────┘   └──────────────┘
```

### Le Juge = Client privilégié
Le Juge **n'héberge plus de serveur**. Il se connecte comme tous les autres clients, mais dispose de **permissions d'administration** gérées côté serveur (rôle `judge`).

---

## 📁 Structure du projet

```
BattleMind/
│
├── shared/                         # ✅ AMÉLIORATION 1 — Types partagés
│   ├── game.types.ts               # Types communs (Player, Team, Match…)
│   ├── socket.types.ts             # Événements Socket.IO typés
│   └── constants.ts                # Constantes du jeu (timers, vies…)
│
├── server/                         # Serveur Node.js (tourne sur PC)
│   ├── package.json
│   ├── tsconfig.json               # "paths": { "@shared/*": ["../../shared/*"] }
│   ├── src/
│   │   ├── config.ts               # ✅ AMÉLIORATION 5 — Config centralisée
│   │   ├── server.ts               # Point d'entrée Express + Socket.IO
│   │   ├── sockets/
│   │   │   ├── index.ts            # Enregistrement de tous les handlers
│   │   │   ├── roomHandlers.ts     # Créer/rejoindre une salle
│   │   │   ├── lobbyHandlers.ts    # Gestion du lobby et équipes
│   │   │   ├── matchHandlers.ts    # Logique Discussion & Enchère
│   │   │   ├── judgeHandlers.ts    # Actions réservées au Juge
│   │   │   ├── jokerHandlers.ts    # Gestion des Jokers
│   │   │   ├── chatHandlers.ts     # Chat privé par équipe
│   │   │   └── heartbeatHandlers.ts # ✅ AMÉLIORATION 3 — Heartbeat
│   │   ├── game/
│   │   │   ├── RoomManager.ts      # Gestion des salles actives (Map)
│   │   │   ├── TournamentEngine.ts # Génération et avancement du bracket
│   │   │   ├── MatchEngine.ts      # Mode Discussion & Enchère
│   │   │   ├── TimerManager.ts     # Chronomètres officiels (10s/30s/5s)
│   │   │   └── TeamManager.ts      # Vies, jokers, capitaines
│   │   ├── auth/
│   │   │   └── playerAuth.ts       # ✅ AMÉLIORATION 2 — Auth légère UUID
│   │   ├── database/
│   │   │   ├── db.ts               # Init SQLite (better-sqlite3)
│   │   │   ├── migrations.ts       # Création des tables
│   │   │   └── seeds.ts            # Questions initiales par catégorie
│   │   ├── questions/
│   │   │   └── questionRepository.ts
│   │   ├── logger/
│   │   │   └── logger.ts           # ✅ AMÉLIORATION 4 — Logs winston
│   │   └── utils/
│   │       ├── generateRoomCode.ts
│   │       └── generateBracket.ts
│   ├── logs/                       # ✅ AMÉLIORATION 4 — Fichiers de logs
│   │   ├── combined.log
│   │   └── error.log
│   └── data/
│       └── battlemind.db
│
└── mobile/                         # Application React Native Android
    ├── package.json
    ├── tsconfig.json               # "paths": { "@shared/*": ["../../shared/*"] }
    ├── babel.config.js             # module-resolver pour @shared
    ├── index.js
    ├── App.tsx
    └── src/
        ├── screens/
        │   ├── splash/SplashScreen.tsx
        │   ├── home/HomeScreen.tsx
        │   ├── role/RoleSelectionScreen.tsx
        │   ├── room/
        │   │   ├── CreateRoomScreen.tsx
        │   │   └── JoinRoomScreen.tsx
        │   ├── lobby/
        │   │   ├── JudgeLobbyScreen.tsx
        │   │   └── TeamLobbyScreen.tsx
        │   ├── match/
        │   │   ├── MatchScreen.tsx
        │   │   ├── DiscussionScreen.tsx
        │   │   └── AuctionScreen.tsx
        │   ├── judge/JudgeControlScreen.tsx
        │   ├── tournament/TournamentBracketScreen.tsx
        │   ├── victory/VictoryScreen.tsx
        │   └── chat/TeamChatScreen.tsx
        ├── components/
        │   ├── ui/
        │   │   ├── NeonButton.tsx
        │   │   ├── GlassCard.tsx
        │   │   ├── CyberBadge.tsx
        │   │   ├── LifeBar.tsx
        │   │   ├── CountdownTimer.tsx
        │   │   └── TeamColorTag.tsx
        │   ├── match/
        │   │   ├── ScoreBoard.tsx
        │   │   ├── QuestionCard.tsx
        │   │   └── JokerButtons.tsx
        │   ├── lobby/
        │   │   ├── PlayerCard.tsx
        │   │   └── TeamSlot.tsx
        │   └── tournament/BracketTree.tsx
        ├── navigation/
        │   ├── AppNavigator.tsx
        │   └── types.ts
        ├── stores/
        │   ├── useAuthStore.ts
        │   ├── useRoomStore.ts
        │   ├── useGameStore.ts
        │   ├── useMatchStore.ts
        │   ├── useTeamStore.ts
        │   └── useChatStore.ts
        ├── socket/
        │   ├── socketClient.ts
        │   ├── events.ts
        │   └── handlers/
        │       ├── gameHandlers.ts
        │       ├── matchHandlers.ts
        │       └── chatHandlers.ts
        ├── hooks/
        │   ├── useSocket.ts
        │   ├── useMatch.ts
        │   └── useJoker.ts
        ├── config/
        │   └── serverConfig.ts     # ✅ AMÉLIORATION 5 — Config serveur mobile
        ├── constants/
        │   ├── theme.ts
        │   └── socketEvents.ts
        └── utils/
            └── formatTime.ts
```

---

## 📐 Modèles TypeScript — Dossier `shared/`

> [!IMPORTANT]
> **Amélioration 1 — Dossier `shared/`** : Les types sont définis **une seule fois** dans `shared/` et importés via alias `@shared/*` aussi bien côté serveur que côté mobile. Plus de duplication, une seule source de vérité.

### `shared/game.types.ts`

```typescript
export type Role = 'judge' | 'player';
export type TeamColor = 'blue' | 'red' | 'yellow' | 'white';
export type GameMode = 'discussion' | 'auction';
export type QuestionMode = 'free' | 'official';
export type TournamentPhase = 'semi-final' | 'final';
export type QuestionCategory =
  | 'geography' | 'history' | 'sciences' | 'sport'
  | 'music' | 'cinema' | 'computing' | 'africa'
  | 'cameroon' | 'general';

export interface Player {
  id: string;             // UUID généré par le serveur
  pseudo: string;
  teamColor: TeamColor | null;
  isCaptain: boolean;
  role: Role;
  socketId: string;
  lastPing?: number;      // Timestamp du dernier heartbeat reçu
}

export interface Team {
  color: TeamColor;
  players: Player[];
  lives: number;          // max 2
  jokerTime: boolean;
  jokerHint: boolean;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  // ⚠️ answer n'est JAMAIS dans ce type partagé — uniquement dans QuestionInternal (serveur)
  hint?: string;          // Envoyé uniquement si Joker Indice activé
  category: QuestionCategory;
  mode: QuestionMode;
}

export interface Match {
  id: string;
  teamA: TeamColor;
  teamB: TeamColor;
  phase: TournamentPhase;
  currentMode: GameMode | null;
  activeTeam: TeamColor | null;
  status: 'pending' | 'ongoing' | 'finished';
  winnerId: TeamColor | null;
}

export interface TournamentBracket {
  semiFinal1: Match;
  semiFinal2: Match;
  final: Match | null;
}

export interface Room {
  code: string;
  judgeSocketId: string;
  questionMode: QuestionMode;
  status: 'waiting' | 'in-lobby' | 'in-match' | 'finished';
}
```

### `shared/constants.ts`

```typescript
// ✅ AMÉLIORATION 1 — Constantes partagées, une seule source de vérité
export const GAME_CONSTANTS = {
  MAX_LIVES: 2,
  MIN_PLAYERS_PER_TEAM: 2,
  MAX_PLAYERS_PER_TEAM: 5,
  TEAMS: ['blue', 'red', 'yellow', 'white'] as const,
  DISCUSSION_TIMER: 10,
  AUCTION_TIMER: 30,
  BID_TIMER: 5,
  JOKER_TIME_BONUS: 10,
  MAX_ATTEMPTS: 2,
  // Heartbeat
  HEARTBEAT_INTERVAL: 5000,   // ms — client envoie ping toutes les 5s
  HEARTBEAT_TIMEOUT: 15000,   // ms — déconnecté si pas de pong après 15s
} as const;
```

### `shared/socket.types.ts`

```typescript
import type { Room, Player, Team, Match, TournamentBracket, TeamColor, GameMode, QuestionCategory, Question } from './game.types';

// Serveur → Clients
export interface ServerToClientEvents {
  // Salle
  'room:created': (room: Room) => void;
  'room:joined': (room: Room, player: Player) => void;
  'room:error': (message: string) => void;

  // Auth
  'auth:success': (player: Player) => void;   // Retourne l'UUID attribué
  'auth:error': (reason: string) => void;      // Pseudo invalide/déjà pris

  // Lobby
  'lobby:updated': (players: Player[], teams: Team[]) => void;
  'lobby:teamFull': (teamColor: TeamColor) => void;

  // Tournoi
  'tournament:started': (bracket: TournamentBracket) => void;
  'tournament:matchReady': (match: Match) => void;
  'tournament:updated': (bracket: TournamentBracket) => void;
  'tournament:finished': (winner: TeamColor) => void;

  // Match
  'match:modeRequest': (activeTeam: TeamColor) => void;
  'match:modeChosen': (mode: GameMode) => void;
  'match:questionRequest': (adverseTeam: TeamColor) => void;
  'match:questionPending': (question: Question) => void;
  'match:questionValidated': (question: Question) => void;
  'match:questionRefused': () => void;
  'match:respondentChosen': (playerId: string) => void;
  'match:timerStart': (duration: number, phase: string) => void;
  'match:timerUpdate': (remaining: number) => void;
  'match:timerEnd': () => void;
  'match:answerSubmitted': (playerId: string) => void;
  'match:answerValidated': (correct: boolean) => void;
  'match:answerRefused': (attemptsLeft: number) => void;
  'match:lifeUpdate': (teamColor: TeamColor, lives: number) => void;
  'match:teamEliminated': (teamColor: TeamColor) => void;
  'match:roundResult': (winner: TeamColor | 'draw') => void;

  // Enchère
  'auction:bidUpdate': (teamColor: TeamColor, amount: number) => void;
  'auction:bidTurn': (teamColor: TeamColor, timeLeft: number) => void;
  'auction:won': (teamColor: TeamColor, amount: number) => void;

  // Jokers
  'joker:timeAdded': (teamColor: TeamColor, newDuration: number) => void;
  'joker:hintRevealed': (hint: string) => void;

  // Chat
  'chat:message': (msg: ChatMessage) => void;

  // Heartbeat — ✅ AMÉLIORATION 3
  'pong': () => void;

  // Système
  'judge:disconnected': () => void;
  'player:disconnected': (playerId: string) => void;
}

// Clients → Serveur
export interface ClientToServerEvents {
  // Salle
  'room:create': (pseudo: string, questionMode: QuestionMode) => void;
  'room:join': (code: string, pseudo: string) => void;

  // Lobby
  'lobby:chooseTeam': (teamColor: TeamColor) => void;
  'lobby:ready': () => void;

  // Match
  'match:chooseMode': (mode: GameMode) => void;
  'match:submitQuestion': (text: string, category: QuestionCategory) => void;
  'judge:validateQuestion': (approved: boolean) => void;
  'match:submitAnswer': (answer: string) => void;
  'judge:validateAnswer': (approved: boolean) => void;

  // Enchère
  'auction:bid': (amount: number) => void;

  // Jokers
  'joker:useTime': () => void;
  'joker:useHint': () => void;

  // Chat
  'chat:send': (text: string) => void;

  // Heartbeat — ✅ AMÉLIORATION 3
  'ping': () => void;
}

export interface ChatMessage {
  id: string;
  senderPseudo: string;
  teamColor: TeamColor;
  text: string;
  timestamp: number;
}
```

---

## 🗺️ Navigation Mobile

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  RoleSelection: undefined;
  // Juge
  CreateRoom: undefined;
  JudgeLobby: { roomCode: string };
  JudgeControl: undefined;
  // Joueur
  JoinRoom: undefined;
  TeamLobby: { roomCode: string };
  Match: undefined;
  // Commun
  TournamentBracket: undefined;
  Victory: { winner: TeamColor };
  TeamChat: undefined;
};
```

### Flux de navigation

```
Splash → Home → RoleSelection
                  ├── [Juge]   → CreateRoom → JudgeLobby → JudgeControl
                  └── [Joueur] → JoinRoom   → TeamLobby  → Match

Match ←→ TeamChat (modal overlay)
Match → TournamentBracket (entre les matchs)
Match fini → Victory
```

---

## 🖥️ Architecture Serveur Node.js

### ✅ Amélioration 5 — Config centralisée (`server/src/config.ts`)

```typescript
// server/src/config.ts
// ⚙️ Toute la configuration réseau au même endroit
export const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },
  socket: {
    cors: { origin: '*' },
    pingTimeout: 15000,
    pingInterval: 5000,
  },
  db: {
    path: './data/battlemind.db',
  },
  logs: {
    dir: './logs',
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;
```

### ✅ Amélioration 4 — Système de logs (`server/src/logger/logger.ts`)

```typescript
import winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
  level: config.logs.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) =>
      `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${config.logs.dir}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${config.logs.dir}/combined.log` }),
  ],
});

// Usage dans les handlers :
// logger.info('Salle créée', { roomCode, judgeId });
// logger.info('Joueur connecté', { pseudo, socketId });
// logger.info('Question validée', { questionId, roomCode });
// logger.info('Réponse refusée', { playerId, attempt });
// logger.info('Match démarré', { matchId, teamA, teamB });
// logger.info('Tournoi terminé', { winner, roomCode });
// logger.error('Erreur socket', { error: err.message });
```

### Événements loggés automatiquement

| Événement | Niveau | Données loggées |
|---|---|---|
| Création salle | `info` | roomCode, judgeId, questionMode |
| Connexion joueur | `info` | pseudo, socketId, roomCode |
| Déconnexion | `warn` | pseudo, socketId, raison |
| Question validée | `info` | questionId, roomCode |
| Question refusée | `info` | roomCode, raison |
| Réponse validée | `info` | playerId, teamColor |
| Réponse refusée | `info` | playerId, tentative restante |
| Match démarré | `info` | matchId, teamA, teamB, phase |
| Fin de match | `info` | matchId, winner |
| Fin de tournoi | `info` | winner, roomCode |
| Erreur socket | `error` | message, stack |

### ✅ Amélioration 2 — Auth légère (`server/src/auth/playerAuth.ts`)

```typescript
import { v4 as uuidv4 } from 'uuid';
import type { Role } from '@shared/game.types';

// Pseudos interdits (réservés au juge / système)
const RESERVED_PSEUDOS = ['juge', 'judge', 'admin', 'system', 'server'];

interface AuthResult {
  success: boolean;
  playerId?: string;
  error?: string;
}

/**
 * Valide un pseudo et génère un UUID unique pour le joueur.
 * Appelé côté serveur lors de room:create ou room:join.
 */
export function authenticatePlayer(
  pseudo: string,
  role: Role,
  existingPseudos: string[]
): AuthResult {
  const trimmed = pseudo.trim();

  if (trimmed.length < 2 || trimmed.length > 20) {
    return { success: false, error: 'Pseudo must be 2–20 characters.' };
  }

  if (RESERVED_PSEUDOS.includes(trimmed.toLowerCase())) {
    return { success: false, error: 'Ce pseudo est réservé.' };
  }

  if (existingPseudos.includes(trimmed.toLowerCase())) {
    return { success: false, error: 'Pseudo déjà utilisé dans cette salle.' };
  }

  return { success: true, playerId: uuidv4() };
}
```

### ✅ Amélioration 3 — Heartbeat (`server/src/sockets/heartbeatHandlers.ts`)

```typescript
import { Server, Socket } from 'socket.io';
import { logger } from '../logger/logger';
import { GAME_CONSTANTS } from '@shared/constants';

/**
 * Enregistre le handler heartbeat pour un socket donné.
 * Le client envoie 'ping' toutes les HEARTBEAT_INTERVAL ms.
 * Si le serveur ne reçoit pas de ping après HEARTBEAT_TIMEOUT ms,
 * le joueur est considéré déconnecté.
 */
export function registerHeartbeat(socket: Socket, io: Server) {
  let missedPings = 0;
  const MAX_MISSED = 3;

  const interval = setInterval(() => {
    missedPings++;
    if (missedPings >= MAX_MISSED) {
      logger.warn('Joueur déconnecté par timeout heartbeat', { socketId: socket.id });
      socket.disconnect(true);
      clearInterval(interval);
    }
  }, GAME_CONSTANTS.HEARTBEAT_TIMEOUT / MAX_MISSED);

  socket.on('ping', () => {
    missedPings = 0;        // Reset le compteur à chaque ping reçu
    socket.emit('pong');    // Répondre au client
  });

  socket.on('disconnect', () => clearInterval(interval));
}
```

**Côté mobile (`mobile/src/socket/socketClient.ts`) :**
```typescript
// Le client envoie un ping toutes les 5 secondes
setInterval(() => {
  if (socket.connected) socket.emit('ping');
}, GAME_CONSTANTS.HEARTBEAT_INTERVAL);

socket.on('pong', () => {
  // Connexion confirmée — optionnel: mettre à jour un indicateur UI
});
```

### `server/src/server.ts`

```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { logger } from './logger/logger';
import { initDatabase } from './database/db';
import { registerAllHandlers } from './sockets';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, config.socket);

initDatabase();
registerAllHandlers(io);

httpServer.listen(config.server.port, config.server.host, () => {
  logger.info(`✅ BattleMind Server running`, {
    host: config.server.host,
    port: config.server.port,
  });
});
```

### `server/src/game/RoomManager.ts`

```typescript
const rooms = new Map<string, RoomState>();

interface RoomState {
  room: Room;
  teams: Map<TeamColor, Team>;
  players: Map<string, Player>;
  bracket: TournamentBracket | null;
  currentMatch: MatchState | null;
}
```

### Règle : La réponse n'est JAMAIS envoyée au client

```typescript
// ✅ Correct : type Question du shared n'expose pas 'answer'
// QuestionInternal (serveur uniquement) contient la réponse
interface QuestionInternal extends Question {
  answer: string;   // Uniquement dans la couche serveur
}

// Lors de l'envoi au client :
const { answer, ...safeQuestion } = internalQuestion;
io.to(roomCode).emit('match:questionValidated', safeQuestion);

// ❌ Interdit
io.to(roomCode).emit('match:questionValidated', internalQuestion);
```

### ✅ Amélioration 5 — Config côté mobile (`mobile/src/config/serverConfig.ts`)

```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Config par défaut — modifiable depuis l'UI
export const DEFAULT_SERVER_PORT = 3000;

export const serverConfig = {
  getServerIp: (): string => storage.getString('serverIp') ?? '',
  setServerIp: (ip: string): void => storage.set('serverIp', ip),
  getServerUrl: (): string => {
    const ip = storage.getString('serverIp') ?? '';
    return `http://${ip}:${DEFAULT_SERVER_PORT}`;
  },
  getLastPseudo: (): string => storage.getString('lastPseudo') ?? '',
  setLastPseudo: (pseudo: string): void => storage.set('lastPseudo', pseudo),
};

// Avantage : pour passer en mode Internet, il suffit de changer getServerUrl()
// ex: return `https://api.battlemind.com`;
```

---

## 🗄️ Base de données SQLite (côté serveur)

### Schema

```sql
-- Questions officielles
CREATE TABLE IF NOT EXISTS questions (
  id          TEXT PRIMARY KEY,
  text        TEXT NOT NULL,
  answer      TEXT NOT NULL,
  hint        TEXT,
  category    TEXT NOT NULL,
  difficulty  INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Catégories (10 min. de questions chacune)

| Catégorie | Code |
|---|---|
| Géographie | `geography` |
| Histoire | `history` |
| Sciences | `sciences` |
| Sport | `sport` |
| Musique | `music` |
| Cinéma | `cinema` |
| Informatique | `computing` |
| Afrique | `africa` |
| Cameroun | `cameroon` |
| Culture générale | `general` |

**Total minimum** : 100 questions en seed

### Usage MMKV côté mobile (uniquement)

```typescript
// Préférences locales uniquement — pas de logique jeu
mmkv.set('serverIp', '192.168.1.X');
mmkv.set('lastPseudo', 'Player1');
mmkv.set('preferredTeam', 'blue');
```

---

## 🎮 Logique Métier (entièrement côté serveur)

### Contraintes des équipes

> [!NOTE]
> Toutes les constantes sont importées depuis `@shared/constants` — voir `shared/constants.ts` défini plus haut.

```typescript
import { GAME_CONSTANTS } from '@shared/constants';
// MAX_LIVES, MIN/MAX_PLAYERS_PER_TEAM, TEAMS, timers… tout est centralisé
```

### Tournoi (généré automatiquement)

```
Demi-finale 1 : Bleu vs Rouge
Demi-finale 2 : Jaune vs Blanc
Finale        : Vainqueur SF1 vs Vainqueur SF2
```

### Mode Discussion (serveur gère tout)

```
1. Serveur → active team : 'match:modeRequest'
2. Active team → serveur : 'match:chooseMode' (discussion)
3. Serveur → équipe adverse : 'match:questionRequest'
4. Adverse → serveur : 'match:submitQuestion'
5. Serveur → juge : 'match:questionPending'
6. Juge → serveur : 'judge:validateQuestion' (true/false)
   → false : retour étape 4
   → true : serveur démarre timer 10s, notifie tous
7. Joueur désigné → serveur : 'match:submitAnswer'
8. Juge → serveur : 'judge:validateAnswer' (true/false)
   → false (tentative 1) : serveur relance timer 10s
   → false (tentative 2) : serveur = équipe active perd la manche
   → true : équipe active marque
9. Si active a réussi → même question pour l'adverse (retour étape 7)
10. Serveur calcule vainqueur, met à jour les vies, émet 'match:lifeUpdate'
11. Si vies = 0 → 'match:teamEliminated' + avancement tournoi
```

### Mode Enchère (serveur gère tout)

```
1. Active team → 'match:chooseMode' (auction)
2. Adverse soumet question → Juge valide
3. Serveur alterne les tours d'enchère (5s chacun)
   → Chaque enchère : 'auction:bidTurn' + 'auction:bidUpdate'
4. Serveur détermine le vainqueur de l'enchère
5. Serveur démarre timer 30s → 'match:timerStart'
6. Équipe fournit N réponses
7. Juge valide chaque réponse
8. Serveur compte : si N validées → victoire | sinon → perd une vie
```

---

## ✅ Plan de Développement par Phases

### 🔧 Phase 0 — Setup Projet (Jour 1)

**Dossier `shared/` — ✅ Amélioration 1 :**
- [ ] Créer `shared/game.types.ts` — tous les types communs
- [ ] Créer `shared/socket.types.ts` — événements Socket.IO
- [ ] Créer `shared/constants.ts` — constantes du jeu + heartbeat

**Serveur :**
- [ ] Initialiser `server/` : `npm init`, TypeScript, Express, Socket.IO, better-sqlite3, uuid, winston
- [ ] Créer la structure des dossiers serveur
- [ ] Configurer `tsconfig.json` avec alias `@shared` → `../../shared`
- [ ] Créer `server/src/config.ts` — ✅ Amélioration 5
- [ ] Créer `server/src/logger/logger.ts` — ✅ Amélioration 4
- [ ] Créer `server/src/auth/playerAuth.ts` — ✅ Amélioration 2
- [ ] Créer `server/logs/` (dossier vide avec `.gitkeep`)

**Mobile :**
- [ ] Nettoyer le projet React Native existant
- [ ] Déplacer le code dans `mobile/`
- [ ] Installer toutes les dépendances mobile
- [ ] Configurer `tsconfig.json` avec alias `@shared` → `../../shared`
- [ ] Configurer `babel.config.js` avec `babel-plugin-module-resolver` pour `@shared`
- [ ] Créer `mobile/src/config/serverConfig.ts` — ✅ Amélioration 5
- [ ] Créer la structure `src/`

### 📊 Phase 1 — Base de données & Questions (Jour 2)
- [ ] Schéma SQLite côté serveur (`migrations.ts`)
- [ ] Seed : 100 questions (10 par catégorie, avec hints)
- [ ] `questionRepository.ts` : get par catégorie, get aléatoire
- [ ] Tester les requêtes SQLite

### 🌐 Phase 2 — Couche Socket.IO + Auth + Heartbeat (Jour 3)
**Serveur :**
- [ ] `server.ts` : Express + Socket.IO avec `config.ts`
- [ ] `RoomManager.ts` : création et gestion des salles en mémoire
- [ ] `roomHandlers.ts` : `room:create`, `room:join` avec appel à `playerAuth.ts`
- [ ] `heartbeatHandlers.ts` : ping/pong — ✅ Amélioration 3
- [ ] Vérification pseudo : doublon + mots réservés — ✅ Amélioration 2
- [ ] Logs sur chaque événement clé — ✅ Amélioration 4
- [ ] Tester depuis un client web (Postman/browser)

**Mobile :**
- [ ] `socketClient.ts` : connexion via `serverConfig.getServerUrl()`
- [ ] Heartbeat client : envoi `ping` toutes les 5s — ✅ Amélioration 3
- [ ] `useSocket.ts` hook
- [ ] Test de connexion LAN entre PC et téléphone

### 🧭 Phase 3 — Navigation & Fondations Mobile (Jour 4)
- [ ] `AppNavigator.tsx` avec tous les écrans enregistrés
- [ ] `SplashScreen` → `HomeScreen` → `RoleSelectionScreen`
- [ ] Tous les stores Zustand initialisés
- [ ] Thème + composants UI de base (`NeonButton`, `GlassCard`)

### 🏠 Phase 4 — Création & Lobby (Jour 5-6)
**Serveur :**
- [ ] `lobbyHandlers.ts` : `lobby:chooseTeam`, `lobby:updated`
- [ ] Validation contraintes (min 2 / max 5 par équipe)
- [ ] Désignation capitaine (premier inscrit)
- [ ] `lobby:ready` : vérification prête → démarrer tournoi

**Mobile :**
- [ ] `CreateRoomScreen` : saisie pseudo, mode questions, affichage IP + code
- [ ] `JoinRoomScreen` : saisie IP serveur + code salle
- [ ] `JudgeLobbyScreen` : liste joueurs, bouton démarrer
- [ ] `TeamLobbyScreen` : sélection équipe (4 slots colorés)
- [ ] `PlayerCard` + `TeamSlot` composants

### 🌳 Phase 5 — Tournoi (Jour 7)
**Serveur :**
- [ ] `TournamentEngine.ts` : génération bracket fixe (SF1: Bleu/Rouge, SF2: Jaune/Blanc)
- [ ] `tournament:started` → clients
- [ ] Avancement automatique après élimination

**Mobile :**
- [ ] `TournamentBracketScreen` : affichage arbre visuel
- [ ] `BracketTree` composant
- [ ] Mise à jour en temps réel du bracket

### ⚔️ Phase 6 — Mode Discussion (Jour 8-9)
**Serveur :**
- [ ] `MatchEngine.ts` : logique complète Mode Discussion
- [ ] `TimerManager.ts` : chronomètre officiel 10s côté serveur
- [ ] Gestion 2 tentatives, calcul vainqueur manche

**Mobile :**
- [ ] `MatchScreen` : header scores/vies, indicateur mode
- [ ] `DiscussionScreen` : question affichée, champ réponse, timer
- [ ] `JudgeControlScreen` : boutons Valider/Refuser question + réponse
- [ ] `CountdownTimer` : animé avec Reanimated
- [ ] `LifeBar` : ❤️ mis à jour en temps réel

### 💰 Phase 7 — Mode Enchère (Jour 10)
**Serveur :**
- [ ] `MatchEngine.ts` : logique Mode Enchère
- [ ] Alternance tours 5s, détermination vainqueur enchère
- [ ] Timer 30s pour les réponses

**Mobile :**
- [ ] `AuctionScreen` : interface enchères avec montée des mises
- [ ] Affichage tour d'enchère + mise actuelle
- [ ] Validation des réponses multiples

### 🃏 Phase 8 — Jokers (Jour 11)
**Serveur :**
- [ ] `jokerHandlers.ts` : `joker:useTime`, `joker:useHint`
- [ ] Validation usage unique par équipe par match
- [ ] Modification du timer en cours + envoi de l'indice

**Mobile :**
- [ ] `JokerButtons` composant : état disponible/utilisé
- [ ] Intégration dans `MatchScreen`

### 💬 Phase 9 — Chat d'équipe (Jour 12)
**Serveur :**
- [ ] `chatHandlers.ts` : filtrage par `teamColor` (room Socket.IO par équipe)
- [ ] Chaque équipe dans sa propre room socket : `chat:blue`, `chat:red`...

**Mobile :**
- [ ] `TeamChatScreen` : interface chat
- [ ] `useChatStore` : messages affichés
- [ ] Overlay accessible depuis le match

### 🏆 Phase 10 — Victoire & Fin de tournoi (Jour 13)
**Serveur :**
- [ ] Élimination automatique à 0 vies
- [ ] Avancement vers la finale
- [ ] `tournament:finished` avec champion

**Mobile :**
- [ ] `VictoryScreen` : écran animé champion du tournoi
- [ ] Gestion déconnexion Juge → `judge:disconnected` → fin de partie

### 🎨 Phase 11 — Polish & Tests (Jour 14)
- [ ] Animations Reanimated sur transitions, timer, vies
- [ ] Tests LAN multi-appareils (3-4 téléphones + PC)
- [ ] Gestion des cas limites (déconnexion joueur, réseau instable)
- [ ] Corrections de bugs
- [ ] Optimisation performances

---

## 🎨 Design System Mobile

```typescript
// constants/theme.ts
export const colors = {
  background:   '#0D1117',
  surface:      '#161B22',
  surfaceLight: '#1C2333',
  primary:      '#00FFD4',   // Cyan néon (accent principal)
  secondary:    '#A855F7',   // Violet néon
  text:         '#FFFFFF',
  textMuted:    '#8B9CB6',
  success:      '#22C55E',
  danger:       '#EF4444',
  warning:      '#F59E0B',
  teams: {
    blue:   '#3B82F6',
    red:    '#EF4444',
    yellow: '#EAB308',
    white:  '#F8FAFC',
  }
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const borderRadius = { sm: 8, md: 12, lg: 16, xl: 24 };
```

---

## 🔮 Roadmap Futures versions

| Fonctionnalité | Version |
|---|---|
| Découverte LAN automatique (mDNS/Bonjour) | v1.1 |
| Connexion par QR Code | v1.1 |
| Mode Internet (serveur cloud) | v2.0 — `serverConfig.ts` simplifie la migration |
| Profil joueur persistant | v2.0 |
| Système de rangs et statistiques | v2.0 |
| iOS support | v2.0 |

---

## 📋 Récapitulatif des 5 Améliorations

| # | Amélioration | Fichier(s) clé(s) | Avantage |
|---|---|---|---|
| 1 | **Dossier `shared/`** | `shared/game.types.ts`, `shared/socket.types.ts`, `shared/constants.ts` | Source de vérité unique, zéro duplication |
| 2 | **Auth légère UUID** | `server/src/auth/playerAuth.ts` | Évite les doublons de pseudo et l'usurpation du rôle Juge |
| 3 | **Heartbeat ping/pong** | `server/src/sockets/heartbeatHandlers.ts`, `mobile/src/socket/socketClient.ts` | Détection rapide des déconnexions Wi-Fi |
| 4 | **Logs serveur winston** | `server/src/logger/logger.ts`, `server/logs/` | Diagnostic, historique, débogage facilité |
| 5 | **Config centralisée** | `server/src/config.ts`, `mobile/src/config/serverConfig.ts` | Migration LAN → Internet en changeant une seule ligne |

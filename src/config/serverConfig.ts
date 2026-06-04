// ============================================================
// BattleMind Mobile — Configuration Serveur & MMKV
// Gère l'IP du serveur LAN et le pseudo persistés en local.
// ============================================================

import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';

// ✅ Lazy initialization : l'instance est créée seulement lors du premier appel,
//    évitant l'erreur JSI qui survient quand MMKV est instancié au niveau global.
let _storage: MMKV | null = null;
const getStorage = (): MMKV => {
  if (!_storage) {
    _storage = createMMKV();
  }
  return _storage;
};

export const DEFAULT_SERVER_PORT = 3000;
export const DEFAULT_ONLINE_URL = 'https://battlemind-server.onrender.com'; // À mettre à jour après déploiement

export type ConnectionMode = 'local' | 'online';

export const serverConfig = {
  /** Récupère le mode de connexion (local par défaut) */
  getConnectionMode: (): ConnectionMode => (getStorage().getString('connectionMode') as ConnectionMode) ?? 'local',

  /** Sauvegarde le mode de connexion */
  setConnectionMode: (mode: ConnectionMode): void => getStorage().set('connectionMode', mode),

  /** Récupère l'adresse IP saisie par l'utilisateur */
  getServerIp: (): string => getStorage().getString('serverIp') ?? '',

  /** Sauvegarde l'adresse IP */
  setServerIp: (ip: string): void => getStorage().set('serverIp', ip),

  /** Récupère l'URL Online */
  getOnlineUrl: (): string => getStorage().getString('onlineUrl') ?? DEFAULT_ONLINE_URL,

  /** Sauvegarde l'URL Online */
  setOnlineUrl: (url: string): void => getStorage().set('onlineUrl', url),

  /** Construit l'URL complète de connexion Socket.IO */
  getServerUrl: (): string => {
    const mode = serverConfig.getConnectionMode();
    
    if (mode === 'online') {
      return serverConfig.getOnlineUrl();
    }

    const ip = getStorage().getString('serverIp') ?? '';
    if (!ip) return '';
    return `http://${ip}:${DEFAULT_SERVER_PORT}`;
  },

  /** Récupère le dernier pseudo utilisé */
  getLastPseudo: (): string => getStorage().getString('lastPseudo') ?? '',

  /** Sauvegarde le pseudo */
  setLastPseudo: (pseudo: string): void => getStorage().set('lastPseudo', pseudo),
};

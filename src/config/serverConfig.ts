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

export const serverConfig = {
  /** Récupère l'adresse IP saisie par l'utilisateur */
  getServerIp: (): string => getStorage().getString('serverIp') ?? '',

  /** Sauvegarde l'adresse IP */
  setServerIp: (ip: string): void => getStorage().set('serverIp', ip),

  /** Construit l'URL complète de connexion Socket.IO */
  getServerUrl: (): string => {
    const ip = getStorage().getString('serverIp') ?? '';
    if (!ip) return '';
    return `http://${ip}:${DEFAULT_SERVER_PORT}`;
  },

  /** Récupère le dernier pseudo utilisé */
  getLastPseudo: (): string => getStorage().getString('lastPseudo') ?? '',

  /** Sauvegarde le pseudo */
  setLastPseudo: (pseudo: string): void => getStorage().set('lastPseudo', pseudo),
};

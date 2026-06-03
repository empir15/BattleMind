// ============================================================
// BattleMind Mobile — navigationRef
// Référence de navigation utilisable hors composants React
// (ex: depuis les listeners Socket.IO dans events.ts).
// ============================================================

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigue vers un écran depuis n'importe où dans l'application
 * (sans avoir accès au hook useNavigation).
 */
export function navigate(name: keyof RootStackParamList, params?: any): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

/**
 * Réinitialise la navigation vers un écran racine.
 * Utilisé lors du retour à l'accueil après fin de partie.
 */
export function resetToHome(): void {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }
}

/**
 * Retourne le nom de l'écran actuellement affiché.
 */
export function getCurrentRoute(): string | undefined {
  return navigationRef.getCurrentRoute()?.name;
}

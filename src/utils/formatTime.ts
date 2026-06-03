// ============================================================
// BattleMind Mobile — Utilitaire de formatage du temps
// ============================================================

/**
 * Formate un nombre de secondes en chaîne MM:SS.
 * Exemple : 75 → "01:15"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate un timestamp unix en heure locale HH:MM.
 * Exemple : 1717230000000 → "14:30"
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Retourne une couleur CSS/hex basée sur le ratio de temps restant.
 * > 50% → vert, 20-50% → orange, < 20% → rouge
 */
export function timerColor(remaining: number, total: number): string {
  const ratio = total > 0 ? remaining / total : 0;
  if (ratio > 0.5) return '#22C55E';  // success
  if (ratio > 0.2) return '#F59E0B';  // warning
  return '#EF4444';                   // danger
}

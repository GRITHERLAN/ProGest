// Convierte minutos totales en un texto legible: 90 -> "1 h 30 min".
export function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  if (minutes <= 0) return 'Sin estimar';

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

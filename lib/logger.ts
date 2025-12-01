// lib/logger.ts — Modo TEST
// En este modo, las funciones no hacen nada pero aceptan argumentos para que el build no falle

export async function logAction(userId?: number | null, action?: string) {
  // No hace nada en modo TEST
  return;
}

// Si quieres, puedes agregar otras funciones de logger aquí, todas vacías
export async function logError(error: any, context?: string) {
  return;
}

export async function logInfo(message: string) {
  return;
}

// auth.ts — TEST MODE (no token, no verificación)

export function signToken(payload: object) {
  return "TEST_TOKEN";
}

export function verifyToken(token: string) {
  return { id: 1, role: "ADMIN" }; // siempre válido
}

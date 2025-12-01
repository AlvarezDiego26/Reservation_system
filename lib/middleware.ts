// middleware.ts — TEST MODE (sin auth)

import { NextApiRequest, NextApiResponse } from "next";

export interface AuthRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

export function requireAuth(handler: Function, roles: string[] = []) {
  return async (req: AuthRequest, res: NextApiResponse) => {
    req.user = { id: 1, role: "ADMIN" }; // usuario ficticio
    return handler(req, res);
  };
}

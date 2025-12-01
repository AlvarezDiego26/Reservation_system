import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { signToken } from "../../../lib/auth";
import { withErrorHandler } from "../../../lib/errorHandler";

export default withErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // --- RATE LIMIT DESHABILITADO ---
  // const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  // if (!checkRateLimit(String(ip))) {
  //   res.status(429).json({ error: "Too many requests. Please try again later." });
  //   return;
  // }

  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Missing email" });
    return;
  }

  // Buscar usuario o crear uno temporal
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, password: "test", firstName: "Test", lastName: "User", role: "CLIENT" },
    });
  }

  const token = signToken({ id: user.id, role: user.role });

  // Log deshabilitado en test
  // await logAction(user.id, "User logged in");

  res.status(200).json({
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });
});

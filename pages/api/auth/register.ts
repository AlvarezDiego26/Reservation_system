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

  const { email, name } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  // Crear usuario sin validaciones
  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ");

  const user = await prisma.user.create({
    data: { email, password: "test", firstName, lastName, role: "CLIENT" },
  });

  const token = signToken({ id: user.id, role: user.role });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });
});

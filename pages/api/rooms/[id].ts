// pages/api/rooms/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { requireAuth, AuthRequest } from "../../../lib/middleware";
import { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const roomId = Number(req.query.id);
  if (!Number.isFinite(roomId)) {
    res.status(400).json({ error: "Invalid room ID" });
    return;
  }

  // === OBTENER HABITACIÓN POR ID ===
  if (req.method === "GET") {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.status(200).json(room);
    return;
  }

  // === ACTUALIZAR HABITACIÓN ===
  if (req.method === "PUT") {
    const protectedHandler = requireAuth(
      async (reqAuth: AuthRequest, resAuth: NextApiResponse) => {
        const { number, type, price, capacity, status } = reqAuth.body;

        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
          resAuth.status(404).json({ error: "Room not found" });
          return;
        }

        const updatedRoom = await prisma.room.update({
          where: { id: roomId },
          data: {
            number: number ?? room.number,
            type: type ?? room.type,
            price: price !== undefined ? new Prisma.Decimal(price) : room.price,
            capacity: capacity !== undefined ? Number(capacity) : room.capacity,
            status: status ?? room.status,
          },
        });

        resAuth.status(200).json(updatedRoom);
      },
      ["ADMIN", "SUPERADMIN"]
    );

    protectedHandler(req as AuthRequest, res);
    return;
  }

  // === ELIMINAR HABITACIÓN ===
  if (req.method === "DELETE") {
    const protectedHandler = requireAuth(
      async (_reqAuth: AuthRequest, resAuth: NextApiResponse) => {
        await prisma.room.delete({ where: { id: roomId } });
        resAuth.status(204).end(); // No content
      },
      ["ADMIN", "SUPERADMIN"]
    );

    protectedHandler(req as AuthRequest, res);
    return;
  }

  // Método no permitido
  res.status(405).json({ error: "Method not allowed" });
}

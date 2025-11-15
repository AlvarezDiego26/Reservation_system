// pages/api/admin/overview.ts
import { NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { requireAuth, AuthRequest } from "../../../lib/middleware";
import { withErrorHandler } from "../../../lib/errorHandler";

async function handler(req: AuthRequest, res: NextApiResponse) {
  // Solo se permite GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Contar estadísticas globales
    const [hotels, reservations, admins] = await Promise.all([
      prisma.hotel.count(),
      prisma.reservation.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    return res.status(200).json({
      hotels,
      reservations,
      admins,
    });
  } catch (error) {
    console.error(" Error en /api/admin/overview:", error);
    return res.status(500).json({ error: "Error al obtener estadísticas globales" });
  }
}

// Solo SUPERADMIN puede acceder
export default requireAuth(withErrorHandler(handler), ["SUPERADMIN"]);

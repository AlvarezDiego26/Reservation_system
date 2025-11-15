// pages/api/admin/overview.ts
import { NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { requireAuth, AuthRequest } from "../../../lib/middleware";
import { withErrorHandler } from "../../../lib/errorHandler";

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Totales globales
    const [hotels, reservations, admins] = await Promise.all([
      prisma.hotel.count(),
      prisma.reservation.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

    // Últimos 5 hoteles registrados
    const latestHotels = await prisma.hotel.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        createdAt: true,
      },
    });

    // Actividad mensual (reservas creadas por mes - últimos 12 meses)
    const rawData = await prisma.$queryRaw<
      { month: string; count: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", 'Mon') AS month,
        COUNT(*)::int AS count
      FROM "Reservation"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR("createdAt", 'Mon'), EXTRACT(MONTH FROM "createdAt")
      ORDER BY EXTRACT(MONTH FROM "createdAt");
    `;

    const activity = rawData.map((r) => ({
      label: r.month,
      count: r.count,
    }));

    // Respuesta final
    return res.status(200).json({
      hotels,
      reservations,
      admins,
      activity,
      latestHotels,
    });
  } catch (error) {
    console.error("Error en /api/admin/overview:", error);
    return res.status(500).json({ error: "Error al cargar estadísticas" });
  }
}

// Solo SUPERADMIN puede acceder
export default requireAuth(withErrorHandler(handler), ["SUPERADMIN"]);

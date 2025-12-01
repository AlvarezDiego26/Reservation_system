import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Missing user question" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Traemos solo habitaciones disponibles
    const rooms = await prisma.room.findMany({
      where: { status: "AVAILABLE" },
      select: {
        number: true,
        type: true,
        price: true,
        hotel: { select: { name: true, city: true } },
      },
    });

    const context = JSON.stringify(rooms);

    // Modelo gratuito / estable
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Eres un asistente experto en reservas de hoteles.
Responde SIEMPRE y SOLO con la información disponible en la base de datos.
Cuando se pregunte por recomendaciones, sugiere la mejor opción basada en precio y tipo de habitación disponible.

Pregunta del usuario:
${question}

Información de hoteles y habitaciones disponibles:
${context}
`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    return res.status(200).json({ answer: output });
  } catch (error: any) {
    console.error("ERROR IA:", error);

    if (error.status === 429) {
      return res.status(429).json({
        error: "Se excedió la cuota gratuita de Gemini. Espera unos segundos e inténtalo de nuevo.",
      });
    }

    return res.status(500).json({ error: "IA error" });
  }
}

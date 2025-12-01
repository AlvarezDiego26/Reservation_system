import { NextApiRequest, NextApiResponse } from "next";

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export function withErrorHandler(handler: Handler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      console.error("API Error:", error);

      return res.status(500).json({
        error: "Internal Server Error",
        message: error.message || "Unexpected error",
      });
    }
  };
}

export function throwError(status: number, message: string): never {
  throw new Error(message);
}

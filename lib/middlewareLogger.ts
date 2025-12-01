// middlewareLogger.ts — TEST MODE (desactivado)

export function withLogging(handler: Function) {
  return async (req: any, res: any) => {
    return handler(req, res);
  };
}

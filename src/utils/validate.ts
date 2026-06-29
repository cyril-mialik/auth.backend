import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { format } from "./error.js";

export const validate = <T>(schema: ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: format(result.error),
      });

      return;
    }

    req.body = result.data;
    next();
  };
};

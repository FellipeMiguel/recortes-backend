import { error } from "console";
import { Request, Response, NextFunction, query } from "express";
import { ZodError, AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
        file: (req as any).file,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.errors.map((e) => ({
            field: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      next(err);
    }
  };

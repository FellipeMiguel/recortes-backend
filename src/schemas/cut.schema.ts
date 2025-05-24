/**
 * @swagger
 * components:
 *   schemas:
 *     Recorte:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         sku:
 *           type: string
 *         modelName:
 *           type: string
 *         cutType:
 *           type: string
 *         position:
 *           type: string
 *         productType:
 *           type: string
 *         material:
 *           type: string
 *         materialColor:
 *           type: string
 *         displayOrder:
 *           type: integer
 *         imageUrl:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

import { z } from "zod";

const statusEnum = z.enum(["ATIVO", "EXPIRADO", "PENDENTE"]);

export const createCutSchema = z.object({
  body: z.object({
    sku: z.string().min(1, "SKU is required"),
    modelName: z.string().min(1, "Model name is required"),
    cutType: z.string().min(1, "Cut type is required"),
    position: z.string().min(1, "Position is required"),
    productType: z.string().min(1, "Product type is required"),
    material: z.string().min(1, "Material is required"),
    materialColor: z.string().min(1, "Material color is required"),
    displayOrder: z
      .string()
      .transform((val) => Number(val))
      .refine(
        (n) => Number.isInteger(n) && n > 0,
        "Display order must be a positive integer"
      ),
    status: statusEnum.optional(),
  }),
  file: z
    .any()
    .refine(
      (file) => file && file.mimetype.startsWith("image/"),
      "Image file is required"
    ),
});

export const updateCutSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    sku: z.string().optional(),
    modelName: z.string().optional(),
    cutType: z.string().optional(),
    position: z.string().optional(),
    productType: z.string().optional(),
    material: z.string().optional(),
    materialColor: z.string().optional(),
    displayOrder: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : Number(val)))
      .refine(
        (n) => n === undefined || (Number.isInteger(n) && n > 0),
        "Display order must be a positive integer"
      ),
    status: statusEnum.optional(),
  }),
  file: z
    .any()
    .optional()
    .refine(
      (file) => !file || file.mimetype.startsWith("image/"),
      "If provided, file must be an image"
    ),
});

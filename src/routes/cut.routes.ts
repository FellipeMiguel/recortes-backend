// src/routes/cut.routes.ts

import { Router } from "express";
import multer from "multer";
import * as CutController from "../controllers/cut.controller";
import { validate } from "../middlewares/validate";
import { createCutSchema, updateCutSchema } from "../schemas/cut.schema";
import { authenticateGoogle } from "../middlewares/auth";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recortes
 *   description: API endpoints para CRUD de recortes
 */

/**
 * @swagger
 * /cuts:
 *   post:
 *     summary: Cria um novo recorte
 *     tags: [Recortes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               modelName:
 *                 type: string
 *               cutType:
 *                 type: string
 *               position:
 *                 type: string
 *               productType:
 *                 type: string
 *               material:
 *                 type: string
 *               materialColor:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ATIVO, EXPIRADO, PENDENTE]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Recorte criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recorte'
 *       '400':
 *         description: Requisição inválida ou validação falhou
 *       '401':
 *         description: Não autorizado
 */
router.post(
  "/",
  authenticateGoogle,
  upload.single("image"),
  validate(createCutSchema),
  CutController.create
);

/**
 * @swagger
 * /cuts:
 *   get:
 *     summary: Lista todos os recortes do usuário autenticado
 *     tags: [Recortes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página (default 10)
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *         description: Filtrar por SKU
 *       - in: query
 *         name: cutType
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de recorte
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, EXPIRADO, PENDENTE]
 *         description: Filtrar por status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Campo para ordenação
 *     responses:
 *       '200':
 *         description: Lista de recortes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recorte'
 *                 meta:
 *                   type: object
 *       '401':
 *         description: Não autorizado
 */
router.get("/", authenticateGoogle, CutController.list);

/**
 * @swagger
 * /cuts/{id}:
 *   get:
 *     summary: Obtém um recorte pelo ID (apenas do usuário autenticado)
 *     tags: [Recortes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do recorte
 *     responses:
 *       '200':
 *         description: Recorte encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recorte'
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Recorte não encontrado
 */
router.get("/:id", authenticateGoogle, CutController.getById);

/**
 * @swagger
 * /cuts/{id}:
 *   put:
 *     summary: Atualiza um recorte existente
 *     tags: [Recortes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do recorte
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               modelName:
 *                 type: string
 *               cutType:
 *                 type: string
 *               position:
 *                 type: string
 *               productType:
 *                 type: string
 *               material:
 *                 type: string
 *               materialColor:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ATIVO, EXPIRADO, PENDENTE]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Recorte atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recorte'
 *       '400':
 *         description: Validação falhou
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Recorte não encontrado
 */
router.put(
  "/:id",
  authenticateGoogle,
  upload.single("image"),
  validate(updateCutSchema),
  CutController.update
);

/**
 * @swagger
 * /cuts/{id}:
 *   delete:
 *     summary: Remove um recorte e sua imagem do bucket
 *     tags: [Recortes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do recorte
 *     responses:
 *       '204':
 *         description: Recorte removido com sucesso
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Recorte não encontrado
 */
router.delete("/:id", authenticateGoogle, CutController.remove);

export default router;

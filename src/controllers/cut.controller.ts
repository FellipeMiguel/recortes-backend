import { Request, Response, NextFunction } from "express";
import { PrismaClient, RecortesStatus } from "@prisma/client";
import supabase from "../services/supabase";
import { AuthenticatedRequest } from "../middlewares/auth";
import { extractFilePathFromUrl, uploadImage } from "../utils/string.utils";

const prisma = new PrismaClient();

// POST /cut
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      sku,
      modelName,
      cutType,
      position,
      productType,
      material,
      materialColor,
      displayOrder,
      status,
    } = req.body;

    const { id: userId } = (req as AuthenticatedRequest).user;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageUrl = await uploadImage(req.file, {
      productType,
      cutType,
      material,
      materialColor,
    });

    const recorte = await prisma.recorte.create({
      data: {
        sku,
        modelName,
        cutType,
        position,
        productType,
        material,
        materialColor,
        displayOrder: Number(displayOrder),
        imageUrl,
        userId,
        status,
      },
    });

    return res.status(201).json(recorte);
  } catch (err) {
    next(err);
  }
};

// GET /cut
export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "10",
      sku,
      cutType,
      status,
      sortBy = "displayOrder",
    } = req.query as Record<string, string>;
    const { id: userId } = (req as AuthenticatedRequest).user;

    const where: any = { userId };
    if (sku) where.sku = sku;
    if (cutType) where.cutType = cutType;
    if (status) where.status = status as RecortesStatus;

    const pageNum = Number(page);
    const perPage = Number(limit);

    const [data, total] = await Promise.all([
      prisma.recorte.findMany({
        where,
        orderBy: { [sortBy]: "asc" },
        skip: (pageNum - 1) * perPage,
        take: perPage,
      }),
      prisma.recorte.count({ where }),
    ]);

    res.json({
      data,
      meta: {
        page: pageNum,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /cut/:id
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { id: userId } = (req as AuthenticatedRequest).user;

    const recorte = await prisma.recorte.findFirst({
      where: { id: Number(id), userId },
    });
    if (!recorte) {
      return res.status(404).json({ message: "Recorte not found" });
    }
    res.json(recorte);
  } catch (err) {
    next(err);
  }
};

// PUT /cut/:id
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { id: userId } = (req as AuthenticatedRequest).user;

    const recorteId = Number(id);
    if (isNaN(recorteId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const existing = await prisma.recorte.findFirst({
      where: { id: recorteId, userId },
    });
    if (!existing) {
      return res.status(404).json({ message: "Recorte not found" });
    }

    const {
      sku,
      modelName,
      cutType,
      position,
      productType,
      material,
      materialColor,
      displayOrder,
      status,
    } = req.body;

    const data: any = {
      sku,
      modelName,
      cutType,
      position,
      productType,
      material,
      materialColor,
      status,
    };
    if (sku) data.sku = sku;
    if (modelName) data.modelName = modelName;
    if (cutType) data.cutType = cutType;
    if (position) data.position = position;
    if (productType) data.productType = productType;
    if (material) data.material = material;
    if (materialColor) data.materialColor = materialColor;
    if (status) data.status = status;
    if (displayOrder !== undefined) {
      data.displayOrder = Number(displayOrder);
    }

    if (req.file) {
      data.imageUrl = await uploadImage(req.file, {
        productType,
        cutType,
        material,
        materialColor,
      });
    }

    const updated = await prisma.recorte.update({
      where: { id: Number(id) },
      data,
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /cut/:id
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { id: userId } = (req as AuthenticatedRequest).user;

    const existing = await prisma.recorte.findFirst({
      where: { id: Number(id), userId },
    });
    if (!existing) {
      return res.status(404).json({ message: "Recorte not found" });
    }

    const filePath = extractFilePathFromUrl(existing.imageUrl);
    if (!filePath) {
      console.warn("Could not extract image path from URL.");
    } else {
      const { error: removeErr } = await supabase.storage
        .from("recortes")
        .remove([filePath]);

      if (removeErr) {
        console.warn("Failed to remove image from storage:", removeErr.message);
      }
    }

    // Deletar o registro no banco
    await prisma.recorte.delete({ where: { id: Number(id) } });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

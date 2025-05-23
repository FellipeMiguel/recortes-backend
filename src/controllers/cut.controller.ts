import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import supabase from "../services/supabase";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const prisma = new PrismaClient();

function makeFilename(original: string) {
  const ext = original.split(".").pop();
  return `${uuidv4()}.${ext}`;
}

async function uploadImage(file: Express.Multer.File) {
  const filename = makeFilename(file.originalname);
  const { error: upErr } = await supabase.storage
    .from("recortes")
    .upload(filename, file.buffer, { contentType: file.mimetype });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from("recortes").getPublicUrl(filename);

  return data.publicUrl;
}

function extractFilePathFromUrl(url: string): string {
  const match = url.match(/recortes\/(.+)$/);
  return match ? `recortes/${match[1].split("?")[0]}` : "";
}

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
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageUrl = await uploadImage(req.file);

    const cut = await prisma.recorte.create({
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
      },
    });

    return res.status(201).json(cut);
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
      sortBy = "displayOrder",
    } = req.query as Record<string, string>;

    const where: any = {};
    if (sku) where.sku = sku;
    if (cutType) where.cutType = cutType;

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
    const cut = await prisma.recorte.findUnique({
      where: { id: Number(id) },
    });

    if (!cut) {
      return res.status(404).json({ message: "Cut not found" });
    }
    res.json(cut);
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
    const existing = await prisma.recorte.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) res.status(404).json({ message: "Cut not found" });

    const {
      sku,
      modelName,
      cutType,
      position,
      productType,
      material,
      materialColor,
      displayOrder,
    } = req.body;

    const data: any = {
      sku,
      modelName,
      cutType,
      position,
      productType,
      material,
      materialColor,
    };

    if (displayOrder !== undefined) {
      data.displayOrder = Number(displayOrder);
    }

    if (req.file) {
      data.imageUrl = await uploadImage(req.file);
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
    const existing = await prisma.recorte.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) return res.status(404).json({ message: "Cut not found" });

    const filename = extractFilePathFromUrl(existing.imageUrl);
    const { error: removeErr } = await supabase.storage
      .from("recortes")
      .remove([filename]);

    if (removeErr) {
      console.warn("Failed to remove image from storage", removeErr);
    }

    await prisma.recorte.delete({ where: { id: Number(id) } });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

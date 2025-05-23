import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import supabase from "../services/supabase";
import multer from "multer";

const prisma = new PrismaClient();

async function uploadImage(
  file: Express.Multer.File,
  metadata: {
    productType: string;
    cutType: string;
    material: string;
    materialColor: string;
  }
): Promise<string> {
  const keyBase = makeKey(metadata);
  const ext = file.originalname.split(".").pop();
  const filename = `${keyBase}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("recortes")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from("recortes").getPublicUrl(filename);

  return data.publicUrl;
}

function extractFilePathFromUrl(url: string): string {
  const match = url.match(/recortes\/(.+)$/);
  return match ? `recortes/${match[1].split("?")[0]}` : "";
}

function sanitize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function makeKey(data: {
  productType: string;
  cutType: string;
  material: string;
  materialColor: string;
}): string {
  const { productType, cutType, material, materialColor } = data;
  return [
    sanitize(productType),
    sanitize(cutType),
    sanitize(material),
    sanitize(materialColor),
  ].join("_");
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

    const imageUrl = await uploadImage(req.file, {
      productType,
      cutType,
      material,
      materialColor,
    });

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
    const existing = await prisma.recorte.findUnique({
      where: { id: Number(id) },
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

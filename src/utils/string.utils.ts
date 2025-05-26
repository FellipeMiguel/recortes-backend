import supabase from "../services/supabase";

export async function uploadImage(
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

export function extractFilePathFromUrl(url: string): string {
  const match = url.match(/recortes\/(.+)$/);
  return match ? `recortes/${match[1].split("?")[0]}` : "";
}

export function sanitize(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

interface MakeKeyData {
  productType: string | null | undefined;
  cutType: string | null | undefined;
  material: string | null | undefined;
  materialColor: string | null | undefined;
}

export function makeKey(data: MakeKeyData): string {
  const { productType, cutType, material, materialColor } = data;
  return [
    sanitize(productType),
    sanitize(cutType),
    sanitize(material),
    sanitize(materialColor),
  ]
    .filter((part) => part && part.length > 0)
    .join("_");
}

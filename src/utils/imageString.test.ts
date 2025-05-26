import { uploadImage } from "./string.utils";
import supabase from "../services/supabase";

jest.mock("../services/supabase", () => ({
  storage: {
    from: jest.fn(),
  },
}));

const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (supabase.storage.from as jest.Mock).mockReturnValue({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  });
});

describe("uploadImage", () => {
  const file: Express.Multer.File = {
    originalname: "image.png",
    buffer: Buffer.from("test"),
    mimetype: "image/png",
    fieldname: "",
    encoding: "",
    size: 4,
    stream: null as any,
    destination: "",
    filename: "",
    path: "",
  };

  const metadata = {
    productType: "Produto",
    cutType: "Corte",
    material: "Material",
    materialColor: "Azul",
  };

  it("uploads image and returns public URL", async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://public.url/image.png" },
    });

    const url = await uploadImage(file, metadata);

    expect(supabase.storage.from).toHaveBeenCalledWith("recortes");
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^produto_corte_material_azul\.png$/),
      file.buffer,
      { contentType: file.mimetype, upsert: true }
    );
    expect(mockGetPublicUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^produto_corte_material_azul\.png$/)
    );
    expect(url).toBe("https://public.url/image.png");
  });

  it("throws error if upload fails", async () => {
    const uploadError = new Error("Upload failed");
    mockUpload.mockResolvedValue({ error: uploadError });

    await expect(uploadImage(file, metadata)).rejects.toThrow("Upload failed");
  });
});

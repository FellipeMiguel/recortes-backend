import { Response, NextFunction } from "express";
import { PrismaClient, RecortesStatus } from "@prisma/client";
import * as stringUtils from "../utils/string.utils";
import { create, list, getById, update, remove } from "./cut.controller";
import { AuthenticatedRequest } from "../middlewares/auth";
import { Readable } from "stream";

jest.mock("@prisma/client");
jest.mock("../utils/string.utils");

const mockPrismaCreate = jest.fn();
const mockPrismaFindMany = jest.fn();
const mockPrismaCount = jest.fn();
const mockPrismaFindFirst = jest.fn();
const mockPrismaUpdate = jest.fn();
const mockPrismaDelete = jest.fn();

(PrismaClient as jest.Mock).mockImplementation(() => ({
  recorte: {
    create: mockPrismaCreate,
    findMany: mockPrismaFindMany,
    count: mockPrismaCount,
    findFirst: mockPrismaFindFirst,
    update: mockPrismaUpdate,
    delete: mockPrismaDelete,
  },
}));

const mockSupabaseRemove = jest.fn();
jest.mock("../services/supabase", () => ({
  __esModule: true,
  default: {
    storage: {
      from: jest.fn(() => ({
        remove: mockSupabaseRemove,
      })),
    },
  },
}));

const createMockMulterFile = (
  originalname: string,
  mimetype = "image/png",
  bufferContent = "image buffer"
): Express.Multer.File => ({
  fieldname: "image",
  originalname,
  encoding: "7bit",
  mimetype,
  size: bufferContent.length,
  buffer: Buffer.from(bufferContent),
  stream: new Readable({
    read() {
      this.push(bufferContent);
      this.push(null);
    },
  }) as any,
  destination: "",
  filename: "",
  path: "",
});

const MOCK_USER_ID = "user-test-123";

describe("cut.controller", () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      query: {},
      params: {},
      file: undefined,
      user: { id: MOCK_USER_ID, email: "test@example.com", name: "Test User" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("create", () => {
    const mockFile = createMockMulterFile("img.png");
    const baseRequestBody = {
      sku: "SKU123",
      modelName: "Model X",
      cutType: "TypeA",
      position: "Front",
      productType: "Shirt",
      material: "Cotton",
      materialColor: "Blue",
      displayOrder: 1,
      status: RecortesStatus.ATIVO,
    };

    beforeEach(() => {
      req.body = { ...baseRequestBody };
      req.file = mockFile;
      (stringUtils.uploadImage as jest.Mock).mockResolvedValue(
        "http://image.url/img.png"
      );
    });

    it("should return 400 if no file is provided", async () => {
      req.file = undefined;
      await create(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Image file is required",
      });
      expect(mockPrismaCreate).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if uploadImage throws", async () => {
      (stringUtils.uploadImage as jest.Mock).mockRejectedValue(
        new Error("upload failed")
      );
      await create(req as AuthenticatedRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "upload failed" })
      );
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    beforeEach(() => {
      req.query = {
        page: "2",
        limit: "5",
        sku: "SKU123",
        cutType: "TypeA",
        status: RecortesStatus.ATIVO,
        sortBy: "displayOrder",
      };
    });

    it("should call next with error if prisma findMany throws", async () => {
      mockPrismaFindMany.mockRejectedValue(new Error("db findMany error"));
      await list(req as AuthenticatedRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    it("should call next with error if prisma count throws", async () => {
      mockPrismaFindMany.mockResolvedValue([]);
      mockPrismaCount.mockRejectedValue(new Error("db count error"));
      await list(req as AuthenticatedRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getById", () => {
    beforeEach(() => {
      req.params = { id: "1" };
    });

    it("should call next with error if prisma throws", async () => {
      mockPrismaFindFirst.mockRejectedValue(new Error("db error"));
      await getById(req as AuthenticatedRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("update", () => {
    const mockExistingRecorte = {
      id: 1,
      userId: MOCK_USER_ID,
      modelName: "Old Model",
      sku: "OLD_SKU",
      cutType: "OldType",
      position: "OldPos",
      productType: "OldProduct",
      material: "OldMat",
      materialColor: "OldColor",
      displayOrder: 1,
      status: RecortesStatus.ATIVO,
      imageUrl: "http://image.url/old.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatePayload = {
      sku: "SKU999",
      modelName: "New Model X",
      displayOrder: 2,
      status: RecortesStatus.PENDENTE,
    };

    beforeEach(() => {
      req.params = { id: "1" };
      req.body = { ...updatePayload };
      req.file = undefined;
      mockPrismaFindFirst.mockResolvedValue(mockExistingRecorte);
      (stringUtils.uploadImage as jest.Mock).mockResolvedValue(
        "http://image.url/new_image.png"
      );
    });

    it("should return 400 for invalid id format", async () => {
      req.params!.id = "abc";
      await update(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid ID format" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error if prisma update throws", async () => {
      mockPrismaUpdate.mockRejectedValue(new Error("db update error"));
      await update(req as AuthenticatedRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("remove", () => {
    const mockRecorte = {
      id: 1,
      userId: MOCK_USER_ID,
      modelName: "DeleteMe",
      imageUrl: "https://url.supabase.co/storage/v1/recortes/img.png",
      sku: "",
      cutType: "",
      position: "",
      productType: "",
      material: "",
      materialColor: "",
      displayOrder: 0,
      status: RecortesStatus.ATIVO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      req.params = { id: "1" };
      mockPrismaFindFirst.mockResolvedValue(mockRecorte);
      mockPrismaDelete.mockResolvedValue(mockRecorte);
      (stringUtils.extractFilePathFromUrl as jest.Mock).mockReturnValue(
        "recortes/img.png"
      );
      mockSupabaseRemove.mockResolvedValue({ error: null, data: {} });
    });

    it("remove: db delete throws", async () => {
      mockPrismaDelete.mockRejectedValue(new Error("db error"));

      await remove(req as AuthenticatedRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

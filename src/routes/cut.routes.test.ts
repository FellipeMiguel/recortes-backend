import request from "supertest";
import express, { Express } from "express";
import cutRoutes from "./cut.routes";
import * as CutController from "../controllers/cut.controller";
import { authenticateGoogle } from "../middlewares/auth";

// Mock dependencies
jest.mock("../controllers/cut.controller");
jest.mock("../middlewares/auth", () => ({
  authenticateGoogle: jest.fn((req, res, next) => next()),
}));

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/cuts", cutRoutes);

describe("Cut Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /cuts", () => {
    it("should call CutController.create with valid data", async () => {
      (CutController.create as jest.Mock).mockImplementation((req, res) =>
        res.status(201).json({ id: "cut123" })
      );

      const res = await request(app)
        .post("/cuts")
        .field("sku", "SKU123")
        .field("modelName", "Model X")
        .field("cutType", "Type A")
        .field("position", "Front")
        .field("productType", "Type1")
        .field("material", "Leather")
        .field("materialColor", "Black")
        .field("displayOrder", "1")
        .field("status", "ATIVO")
        .attach("image", Buffer.from("fakeimg"), "image.png");

      expect(res.status).toBe(201);
      expect(CutController.create).toHaveBeenCalled();
    });
  });

  describe("GET /cuts", () => {
    it("should call CutController.list", async () => {
      (CutController.list as jest.Mock).mockImplementation((req, res) =>
        res.status(200).json({ data: [], meta: {} })
      );

      const res = await request(app).get("/cuts");

      expect(res.status).toBe(200);
      expect(CutController.list).toHaveBeenCalled();
    });
  });

  describe("GET /cuts/:id", () => {
    it("should call CutController.getById", async () => {
      (CutController.getById as jest.Mock).mockImplementation((req, res) =>
        res.status(200).json({ id: req.params.id })
      );

      const res = await request(app).get("/cuts/abc123");

      expect(res.status).toBe(200);
      expect(CutController.getById).toHaveBeenCalled();
    });
  });

  describe("PUT /cuts/:id", () => {
    it("should call CutController.update with valid data", async () => {
      (CutController.update as jest.Mock).mockImplementation((req, res) =>
        res.status(200).json({ id: req.params.id })
      );

      const res = await request(app)
        .put("/cuts/abc123")
        .field("sku", "SKU123")
        .field("modelName", "Model X")
        .field("cutType", "Type A")
        .field("position", "Front")
        .field("productType", "Type1")
        .field("material", "Leather")
        .field("materialColor", "Black")
        .field("displayOrder", "1")
        .field("status", "ATIVO")
        .attach("image", Buffer.from("fakeimg"), "image.png");

      expect(res.status).toBe(200);
      expect(CutController.update).toHaveBeenCalled();
    });
  });

  describe("DELETE /cuts/:id", () => {
    it("should call CutController.remove", async () => {
      (CutController.remove as jest.Mock).mockImplementation((req, res) =>
        res.status(204).send()
      );

      const res = await request(app).delete("/cuts/abc123");

      expect(res.status).toBe(204);
      expect(CutController.remove).toHaveBeenCalled();
    });
  });
});

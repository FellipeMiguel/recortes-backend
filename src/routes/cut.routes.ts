import { Router } from "express";
import multer from "multer";
import * as CutController from "../controllers/cut.controller";
import { validate } from "../middlewares/validate";
import { createCutSchema, updateCutSchema } from "../schemas/cut.schema";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post(
  "/",
  upload.single("image"),
  validate(createCutSchema),
  CutController.create
);

router.get("/", CutController.list);

router.get("/:id", CutController.getById);

router.put(
  "/:id",
  upload.single("image"),
  validate(updateCutSchema),
  CutController.update
);

router.delete("/:id", CutController.remove);

export default router;

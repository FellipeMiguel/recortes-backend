import { Router } from "express";
import multer from "multer";
import * as CutController from "../controllers/cut.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/", upload.single("image"), CutController.create);
router.get("/", CutController.list);
router.get("/:id", CutController.getById);
router.put("/:id", upload.single("image"), CutController.update);
router.delete("/:id", CutController.remove);

export default router;

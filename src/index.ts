import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import cutRoutes from "./routes/cut.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/cuts", cutRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});

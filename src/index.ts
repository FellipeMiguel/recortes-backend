import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
// @ts-ignore
import swaggerConfig from "../swagger/swagger";

import cutRoutes from "./routes/cut.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/cuts", cutRoutes);

const specs = swaggerJsdoc(swaggerConfig);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});

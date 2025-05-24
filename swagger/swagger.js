const pkg = require("../package.json");

module.exports = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: pkg.name,
      version: pkg.version,
      description: pkg.description || "API de Recortes",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Recorte: {
          type: "object",
          properties: {
            id: { type: "string" },
            sku: { type: "string" },
            modelName: { type: "string" },
            cutType: { type: "string" },
            position: { type: "string" },
            productType: { type: "string" },
            material: { type: "string" },
            materialColor: { type: "string" },
            displayOrder: { type: "integer" },
            imageUrl: { type: "string" },
            status: {
              type: "string",
              enum: ["ATIVO", "EXPIRADO", "PENDENTE"],
              description: "Status do recorte",
            },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

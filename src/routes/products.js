import express from "express";
import { checkAdminRole } from "../middlewares/checkRole.js";
// import { options } from "../config/dbConfig.js";
// import { ContenedorArchivo } from "../managers/ContenedorArchivo.js";
// import { ContenedorMysql } from "../managers/ContenedorMysql.js";
import { ContenedorDaoProductos } from "../daos/index.js";

const productosApi = ContenedorDaoProductos;

// products router
const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  const response = await productosApi.getAll();
  res.json(response);
});

productsRouter.get("/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  const response = await productosApi.getById(productId);
  res.json(response);
});

productsRouter.post("/", checkAdminRole, async (req, res) => {
  const response = await productosApi.save(req.body);
  res.json(response);
});

productsRouter.put("/:id", checkAdminRole, async (req, res) => {
  const productId = parseInt(req.params.id);
  const response = await productosApi.updateById(req.body, productId);
  res.json(response);
});

productsRouter.delete("/:id", checkAdminRole, async (req, res) => {
  const productId = parseInt(req.params.id);
  const response = await productosApi.deleteById(productId);
  res.json(response);
});

export { productsRouter };

const express = require("express");
const Contenedor = require("../components/contenedor");
const router = express.Router();

const contenedorProductos = new Contenedor("./src/productos.txt");

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/productos", async (req, res) => {
  res.render("productos", { products: await contenedorProductos.getAll() });
});

router.post("/productos", (req, res) => {
  contenedorProductos.save(req.body);
  res.redirect("/");
});

module.exports = router;

// productsRouter.get("/productos", async (req, res) => {
//   try {
//     const products = await contenedorProductos.getAll();
//     res.render("home");
//   } catch (error) {
//     res.status(500).send("hubo un error en el servidor");
//   }
// });

// productsRouter.post("/productos", async (req, res) => {
//   const newProduct = req.body;
//   const productos = await contenedorProductos.save(newProduct);
//   res.json({
//     message: "producto creado",
//     response: productos,
//   });
// });

// productsRouter.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   const product = await contenedorProductos.getById(parseInt(id));
//   if (product) {
//     res.json({
//       message: "producto encontrado",
//       product: product,
//     });
//   } else {
//     res.json({
//       message: "producto no encontrado",
//     });
//   }
// });

// productsRouter.put("/:id", async (req, res) => {
//   const { id } = req.params;
//   const newInfo = req.body;
//   const productosActualizados = await contenedorProductos.updateById(
//     parseInt(id),
//     newInfo
//   );
//   if (productosActualizados) {
//     res.json({
//       message: `El producto con el id ${id} fue actualizado`,
//       response: productosActualizados,
//     });
//   } else {
//     res.json({
//       message: "producto no encontrado",
//     });
//   }
// });

// productsRouter.delete("/:id", async (req, res) => {
//   const { id } = req.params;
//   const product = await contenedorProductos.deleteById(parseInt(id));
//   if (product) {
//     res.json({
//       message: "producto eliminado",
//       product: product,
//     });
//   } else {
//     res.json({
//       message: "producto no encontrado",
//     });
//   }
// });

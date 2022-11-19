import express from "express";
import { productsRouter } from "./src/routes/products.js";
import { cartsRouter } from "./src/routes/carritos.js";

// crear el server
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/api/productos", productsRouter);
app.use("/api/carrito", cartsRouter);
// levantar server
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));
server.on("error", (error) => console.log(`Error in server ${error}`));

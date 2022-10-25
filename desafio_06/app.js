const express = require("express");
const { productsRouter, products } = require("./src/routes/products");
const handlebars = require("express-handlebars");
const Contenedor = require("./src/components/contenedor");
const { Server } = require("socket.io");

const productosApi = new Contenedor("productos.txt");
// crear el server
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("hbs", handlebars.engine({ extname: "hbs" }));
app.set("views", "./src/views");
app.set("view engine", "hbs");

// routes
app.get("/", (req, res) => {
  res.render("home", { products: products });
});

app.get("/productos", (req, res) => {
  res.render("products", { products: products });
});

app.use("/api/products", productsRouter);

// levantar server
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));

// levantar servidor io
const io = new Server(server);

const historicoMensajes = [];

io.on("connection", async (socket) => {
  console.log("nuevo usuario conectado", socket.id);

  // lista de productos
  socket.emit("products", await productosApi.getAll());
  socket.on("newProduct", async (data) => {
    await productosApi.save(data);
    //actualiza la lista de prod. mas lo que le sumo el cliente
    io.sockets.emit("products", await productosApi.getAll());
  });

  socket.broadcast.emit("newUser");

  // lista de mensajes
  socket.emit("historico", historicoMensajes);
  // recarga los mensajes keydown
  socket.on("message", (data) => {
    console.log(data);
    historicoMensajes.push(data);
    //enviar a todos
    io.sockets.emit("historico", historicoMensajes);
  });
});

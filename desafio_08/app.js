const express = require("express");
const options = require("./src/config/dbConfig");
const { productsRouter, products } = require("./src/routes/products");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const Contenedor = require("./src/components/contenedor");
const ContenedorChat = require("./src/components/contenedorChat");
const ContenedorSql = require("./src/components/ContenedorSql");

// const productosApi = new Contenedor("productos.txt");
const productosApi = new ContenedorSql(options.mariaDB, "products");
// const chatApi = new ContenedorChat("chat.txt");
const chatApi = new ContenedorSql(options.sqliteDB, "chat");

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

app.get("/products", (req, res) => {
  res.render("products", { products: products });
});

app.use("/api/products", productsRouter);

// levantar server
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));

// levantar servidor io
const io = new Server(server);

io.on("connection", async (socket) => {
  // lista de productos
  socket.emit("products", await productosApi.getAll());
  socket.on("newProduct", async (data) => {
    await productosApi.save(data);
    //actualiza la lista de prod. mas lo que le sumo el cliente
    io.sockets.emit("products", await productosApi.getAll());
  });

  // lista de mensajes

  //CHAT
  //Envio de todos los mensajes al socket que se conecta.
  io.sockets.emit("messages", await chatApi.getAll());

  //recibimos el mensaje del usuario y lo guardamos en el archivo chat.txt
  socket.on("newMessage", async (newMsg) => {
    await chatApi.save(newMsg);
    io.sockets.emit("messages", await chatApi.getAll());
  });
});

const express = require("express");
const options = require("./src/config/dbConfig");
const { productsRouter, products } = require("./src/routes/products");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const { normalize, schema } = require("normalizr");
const Contenedor = require("./src/components/contenedor");
const ContenedorChat = require("./src/components/contenedorChat");
const ContenedorSql = require("./src/components/ContenedorSql");
const faker = require("@faker-js/faker");
const { commerce, image } = faker;
faker.locale = "es";

const productosApi = new Contenedor("productos.txt");
// const productosApi = new ContenedorSql(options.mariaDB, "products");
const chatApi = new ContenedorChat("chat.txt");
// const chatApi = new ContenedorSql(options.sqliteDB, "chat");

// crear el server
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine("hbs", handlebars.engine({ extname: "hbs" }));
app.set("views", "./src/views");
app.set("view engine", "hbs");

// normalizacion
// author
const authorSchema = new schema.Entity("authors", {}, { idAtribute: "email" });

// mensajes
const menssageSchema = new schema.Entity("messages", { author: authorSchema });

// normalizacion general
const chatSchema = new schema.Entity(
  "chat",
  {
    menssage: [menssageSchema],
  },
  { idAttribute: "id" }
);
// aplicar normalizacion
// funcion de normalizacion de datos
const normalizarData = (data) => {
  const normalizeData = normalize({ id: "chat", messages: data }, chatSchema);
  return normalizeData;
};

const normalizarMensajes = async () => {
  const results = await chatApi.getAll();
  const messagesNormalized = normalizarData(results);
  return messagesNormalized;
};

// routes
app.get("/", (req, res) => {
  res.render("home", { products: products });
});

app.get("/products", (req, res) => {
  res.render("products", { products: products });
});

app.use("/api/products", productsRouter);

app.get("/test", (req, res) => {
  let arrayProd = [];
  for (let i = 0; i < 5; i++) {
    arrayProd.push({
      nombre: commerce.productName(),
      Precio: commerce.price(100, 5000),
      foto: image.technics(),
    });
  }
  console.log(arrayProd);
  res.send("test");
});

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
  io.sockets.emit("messages", await normalizarMensajes());

  //recibimos el mensaje del usuario y lo guardamos en el archivo chat.txt
  socket.on("newMessage", async (newMsg) => {
    await chatApi.save(newMsg);

    io.sockets.emit("messages", await normalizarMensajes());
  });
});

const express = require("express");
const handlebars = require("express-handlebars");
const router = require("./src/routes/index");
const { Server } = require("socket.io");
const moment = require("moment");

// crear el server
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("hbs", handlebars.engine({ extname: "hbs" }));

app.set("view engine", "hbs");

app.set("views", "./src/views");

app.use(express.static(__dirname + "/public"));

app.use("/", router);

// levantar server
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));

// levantar servidor io
const io = new Server(server);

const historicoMensajes = [];

io.on("connection", (socket) => {
  console.log("nuevo usuario conectado", socket.id);
  //enviar a todos menos al socket conectado
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

import express from "express";
import compression from "compression";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import { normalize, schema } from "normalizr";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { logger } from "./logger.js";
import { options } from "./src/config/dbConfig.js";
import { productsRouter } from "./src/routes/products.js";
import { Contenedor } from "./src/components/contenedor.js";
import { ContenedorChat } from "./src/components/contenedorChat.js";
import { ContenedorSql } from "./src/components/ContenedorSql.js";
import { UserModel } from "./src/models/user.js";
import { config } from "./src/config/envConfig.js";
import parsedArgs from "minimist";
import { fork } from "child_process";
import cluster from "cluster";
import os from "os";

// Faker
import { faker } from "@faker-js/faker";
import { json } from "express";
const { commerce, image } = faker;
faker.locale = "es";

const productosApi = new Contenedor("productos.txt");
// const productosApi = new ContenedorSql(options.mariaDB, "products");
const chatApi = new ContenedorChat("chat.txt");
// const chatApi = new ContenedorSql(options.sqliteDB, "chat");

//conectamos a la base de datos
const mongoUrl = config.DB_USERS;

mongoose.connect(
  mongoUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error)
      return logger.error(`Hubo un error conectandose a la base ${error}`);
    logger.info("conexion a la base de datos de manera exitosa");
  }
);

// crear el server
const app = express();

// middleware
// app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("/public"));

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

// configuracion de db y usuario
app.use(cookieParser());

// usuarios en MongoStore
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.DB_SESSION,
      ttl: 600,
    }),
    secret: "password",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000,
    },
  })
);

//configurar passport
app.use(passport.initialize()); //conectamos a passport con express.
app.use(passport.session()); //vinculacion entre passport y las sesiones de nuestros usuarios.

//serializar un usuario
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//estrategia de registro utilizando passport local.
passport.use(
  "signupStrategy",
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: "email",
    },
    (req, username, password, done) => {
      //logica para registrar al usuario
      //verificar si el usuario exitse en db
      UserModel.findOne({ username: username }, (error, userFound) => {
        if (error) return done(error, null, { message: "Hubo un error" });
        if (userFound) return done(null, null, { message: "Error de logeo" });
        //guardamos el usuario en la db
        const newUser = {
          name: req.body.name,
          username: username,
          password: createHash(password),
        };
        UserModel.create(newUser, (error, userCreated) => {
          if (error)
            return done(error, null, {
              message: "Hubo un error al registrar el usuario",
            });
          return done(null, userCreated);
        });
      });
    }
  )
);
passport.use(
  "loginStrategy",
  new LocalStrategy(
    {
      passReqToCallback: true,
      usernameField: "email",
    },
    (req, username, password, done) => {
      //verificar si el usuario exitse en db
      UserModel.findOne({ username: username }, (error, userFound) => {
        if (error) return done(error, null, { message: "Hubo un error" });
        if (!userFound) return done(null, null, { message: "Error de logeo" });
        return done(null, userFound);
      });
    }
  )
);

//deserializar al usuario
passport.deserializeUser((id, done) => {
  //validar si el usuario existe en db.
  UserModel.findById(id, (err, userFound) => {
    return done(err, userFound);
  });
});

//crear una funcion para encriptar la contrase;
const createHash = (password) => {
  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  return hash;
};

// Rutas

// Home
app.get("/", (req, res) => {
  res.render("home");
});
// Registro
app.get("/registro", (req, res) => {
  const errorMessage = req.session.messages ? req.session.messages[0] : "";
  res.render("signup", { error: errorMessage });
  req.session.messages = [];
});

// Login
app.get("/inicio", (req, res) => {
  res.render("login");
});

// Perfil
const products = productsRouter;
app.get("/tienda", (req, res) => {
  logger.info(req.session);
  if (req.isAuthenticated()) {
    res.render("store", { products: products });
  } else {
    res.send(
      "<div>Debes <a href='/inicio'>inciar sesion</a> o <a href='/registro'>registrarte</a></div>"
    );
  }
});

// Ingreso de datos

// Registro
app.post(
  "/signup",
  passport.authenticate("signupStrategy", {
    failureRedirect: "/registro",
    failureMessage: true,
  }),
  (req, res) => {
    res.redirect("/tienda");
  }
);
// Login
app.post(
  "/login",
  passport.authenticate("loginStrategy", {
    failureRedirect: "/inicio",
    failureMessage: true,
  }),
  (req, res) => {
    return res.redirect("/tienda");
  }
);

//Logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.send("hubo un error al cerrar sesion");
    req.session.destroy();
    res.redirect("/");
  });
});
// Cantidad de Procesadores
const numCPUS = os.cpus().length;

// Rutas extras Desafio 14
// Ruta de argumentos y datos
app.get("/info", compression(), (req, res) => {
  let arrayInfo = [];
  arrayInfo.push({
    arg: process.argv,
    so: process.platform,
    ver: process.version,
    rss: JSON.stringify(process.memoryUsage()),
    path: process.execPath,
    id: process.pid,
    folder: process.cwd(),
    pros: numCPUS,
  });
  // logger.info(arrayInfo);
  console.log(arrayInfo);
  const result = arrayInfo;
  res.render("info", { datos: result });
});
// Ruta de numeros random fork
app.get("/api/randoms", (req, res) => {
  const cant = parseInt(Object.values(req.query));
  logger.info(cant);
  const child = fork("src/operations/child.js");
  //recibimos mensajes del proceso hijo
  child.on("message", (childMsg) => {
    if (childMsg === "ok") {
      //recibimos notificacion del proceso hijo, y le mandamos un mensaje para que comience a operar.
      child.send(cant);
    } else {
      res.json({ resultado: childMsg });
    }
  });
});

// Faker Prod
app.get("/test", (req, res) => {
  let arrayProd = [];
  for (let i = 0; i < 5; i++) {
    arrayProd.push({
      title: commerce.productName(),
      price: commerce.price(100, 5000),
      thumbnail: image.technics(),
    });
  }
  logger.info(arrayProd);
  const result = arrayProd;
  res.render("test", { products: result });
});

// Argumentos con minimist Desafio 14

const defport = {
  alias: { p: "port", m: "mode" },
  default: { m: "FORK", p: 8080 },
};

const objArguments = parsedArgs(process.argv.slice(2), defport);
logger.info(objArguments);
logger.warn("modo fork");
const PORT = objArguments.port;
const MODO = objArguments.mode;

// levantar server (el desafio 14 pide que se ingrese por consola y no por .env)

if (MODO === "CLUSTER" && cluster.isPrimary) {
  logger.warn("modo cluster");
  const numCPUS = os.cpus().length;
  for (let i = 0; i < numCPUS; i++) {
    cluster.fork(); //creamos los subprocesos
  }

  cluster.on("exit", (worker) => {
    logger.error(`El subproceso ${worker.process.pid} falló`);
    cluster.fork();
  });
} else {
  const server = app.listen(PORT, () =>
    logger.info(`listening on port ${PORT}`)
  );
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
}

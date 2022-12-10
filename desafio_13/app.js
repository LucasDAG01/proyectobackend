import express from "express";
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
import { options } from "./src/config/dbConfig.js";
import { productsRouter } from "./src/routes/products.js";
import { Contenedor } from "./src/components/contenedor.js";
import { ContenedorChat } from "./src/components/contenedorChat.js";
import { ContenedorSql } from "./src/components/ContenedorSql.js";
import { UserModel } from "./src/models/user.js";

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
const mongoUrl =
  "mongodb+srv://Armslave:32191204@coderhouse.gnggjpm.mongodb.net/authDB?retryWrites=true&w=majority";

mongoose.connect(
  mongoUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error)
      return console.log(`Hubo un error conectandose a la base ${error}`);
    console.log("conexion a la base de datos de manera exitosa");
  }
);

// crear el server
const app = express();

// middleware
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
// app.use(cookieParser());

// usuarios en MongoStore
app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://Armslave:32191204@coderhouse.gnggjpm.mongodb.net/sessionsDB?retryWrites=true&w=majority",
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
// estaesmiPass => ahjsgduyqwte234296124ahsd-hash
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
  console.log(req.session);
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
  console.log(arrayProd);
  const result = arrayProd;
  res.render("test", { products: result });
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

"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _expressHandlebars = require("express-handlebars");

var _expressHandlebars2 = _interopRequireDefault(_expressHandlebars);

var _socket = require("socket.io");

var _normalizr = require("normalizr");

var _cookieParser = require("cookie-parser");

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _expressSession = require("express-session");

var _expressSession2 = _interopRequireDefault(_expressSession);

var _connectMongo = require("connect-mongo");

var _connectMongo2 = _interopRequireDefault(_connectMongo);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require("passport-local");

var _bcrypt = require("bcrypt");

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _dbConfig = require("./src/config/dbConfig.js");

var _products = require("./src/routes/products.js");

var _contenedor = require("./src/components/contenedor.js");

var _contenedorChat = require("./src/components/contenedorChat.js");

var _ContenedorSql = require("./src/components/ContenedorSql.js");

var _user = require("./src/models/user.js");

var _envConfig = require("./src/config/envConfig.js");

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _child_process = require("child_process");

var _cluster = require("cluster");

var _cluster2 = _interopRequireDefault(_cluster);

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _faker = require("@faker-js/faker");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }
        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(
            function (value) {
              step("next", value);
            },
            function (err) {
              step("throw", err);
            }
          );
        }
      }
      return step("next");
    });
  };
}

// Faker

var commerce = _faker.faker.commerce,
  image = _faker.faker.image;

_faker.faker.locale = "es";

var productosApi = new _contenedor.Contenedor("productos.txt");
// const productosApi = new ContenedorSql(options.mariaDB, "products");
var chatApi = new _contenedorChat.ContenedorChat("chat.txt");
// const chatApi = new ContenedorSql(options.sqliteDB, "chat");

//conectamos a la base de datos
var mongoUrl = _envConfig.config.DB_USERS;

_mongoose2.default.connect(
  mongoUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (error) {
    if (error)
      return console.log("Hubo un error conectandose a la base " + error);
    console.log("conexion a la base de datos de manera exitosa");
  }
);

// crear el server
var app = (0, _express2.default)();

// middleware
app.use(_express2.default.json());
app.use(_express2.default.urlencoded({ extended: true }));
app.use(_express2.default.static("/public"));

app.engine("hbs", _expressHandlebars2.default.engine({ extname: "hbs" }));
app.set("views", "./src/views");
app.set("view engine", "hbs");
// normalizacion
// author
var authorSchema = new _normalizr.schema.Entity(
  "authors",
  {},
  { idAtribute: "email" }
);

// mensajes
var menssageSchema = new _normalizr.schema.Entity("messages", {
  author: authorSchema,
});

// normalizacion general
var chatSchema = new _normalizr.schema.Entity(
  "chat",
  {
    menssage: [menssageSchema],
  },
  { idAttribute: "id" }
);
// aplicar normalizacion
// funcion de normalizacion de datos
var normalizarData = function normalizarData(data) {
  var normalizeData = (0, _normalizr.normalize)(
    { id: "chat", messages: data },
    chatSchema
  );
  return normalizeData;
};

var normalizarMensajes = (function () {
  var _ref = _asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
      var results, messagesNormalized;
      return regeneratorRuntime.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                _context.next = 2;
                return chatApi.getAll();

              case 2:
                results = _context.sent;
                messagesNormalized = normalizarData(results);
                return _context.abrupt("return", messagesNormalized);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        },
        _callee,
        undefined
      );
    })
  );

  return function normalizarMensajes() {
    return _ref.apply(this, arguments);
  };
})();

// configuracion de db y usuario
app.use((0, _cookieParser2.default)());

// usuarios en MongoStore
app.use(
  (0, _expressSession2.default)({
    store: _connectMongo2.default.create({
      mongoUrl: _envConfig.config.DB_SESSION,
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
app.use(_passport2.default.initialize()); //conectamos a passport con express.
app.use(_passport2.default.session()); //vinculacion entre passport y las sesiones de nuestros usuarios.

//serializar un usuario
_passport2.default.serializeUser(function (user, done) {
  done(null, user.id);
});

//estrategia de registro utilizando passport local.
_passport2.default.use(
  "signupStrategy",
  new _passportLocal.Strategy(
    {
      passReqToCallback: true,
      usernameField: "email",
    },
    function (req, username, password, done) {
      //logica para registrar al usuario
      //verificar si el usuario exitse en db
      _user.UserModel.findOne(
        { username: username },
        function (error, userFound) {
          if (error) return done(error, null, { message: "Hubo un error" });
          if (userFound) return done(null, null, { message: "Error de logeo" });
          //guardamos el usuario en la db
          var newUser = {
            name: req.body.name,
            username: username,
            password: createHash(password),
          };
          _user.UserModel.create(newUser, function (error, userCreated) {
            if (error)
              return done(error, null, {
                message: "Hubo un error al registrar el usuario",
              });
            return done(null, userCreated);
          });
        }
      );
    }
  )
);
_passport2.default.use(
  "loginStrategy",
  new _passportLocal.Strategy(
    {
      passReqToCallback: true,
      usernameField: "email",
    },
    function (req, username, password, done) {
      //verificar si el usuario exitse en db
      _user.UserModel.findOne(
        { username: username },
        function (error, userFound) {
          if (error) return done(error, null, { message: "Hubo un error" });
          if (!userFound)
            return done(null, null, { message: "Error de logeo" });
          return done(null, userFound);
        }
      );
    }
  )
);

//deserializar al usuario
_passport2.default.deserializeUser(function (id, done) {
  //validar si el usuario existe en db.
  _user.UserModel.findById(id, function (err, userFound) {
    return done(err, userFound);
  });
});

//crear una funcion para encriptar la contrase;
var createHash = function createHash(password) {
  var hash = _bcrypt2.default.hashSync(
    password,
    _bcrypt2.default.genSaltSync(10)
  );
  return hash;
};

// Rutas

// Home
app.get("/", function (req, res) {
  res.render("home");
});
// Registro
app.get("/registro", function (req, res) {
  var errorMessage = req.session.messages ? req.session.messages[0] : "";
  res.render("signup", { error: errorMessage });
  req.session.messages = [];
});

// Login
app.get("/inicio", function (req, res) {
  res.render("login");
});

// Perfil
var products = _products.productsRouter;
app.get("/tienda", function (req, res) {
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
  _passport2.default.authenticate("signupStrategy", {
    failureRedirect: "/registro",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/tienda");
  }
);
// Login
app.post(
  "/login",
  _passport2.default.authenticate("loginStrategy", {
    failureRedirect: "/inicio",
    failureMessage: true,
  }),
  function (req, res) {
    return res.redirect("/tienda");
  }
);

//Logout
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) return res.send("hubo un error al cerrar sesion");
    req.session.destroy();
    res.redirect("/");
  });
});
// Cantidad de Procesadores
var numCPUS = _os2.default.cpus().length;

// Rutas extras Desafio 14
// Ruta de argumentos y datos
app.get("/info", function (req, res) {
  var arrayInfo = [];
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
  var result = arrayInfo;
  res.render("info", { datos: result });
});
// Ruta de numeros random fork
app.get("/api/randoms", function (req, res) {
  var cant = parseInt(Object.values(req.query));
  console.log(cant);
  var child = (0, _child_process.fork)("src/operations/child.js");
  //recibimos mensajes del proceso hijo
  child.on("message", function (childMsg) {
    if (childMsg === "ok") {
      //recibimos notificacion del proceso hijo, y le mandamos un mensaje para que comience a operar.
      child.send(cant);
    } else {
      res.json({ resultado: childMsg });
    }
  });
});

// Faker Prod
app.get("/test", function (req, res) {
  var arrayProd = [];
  for (var i = 0; i < 5; i++) {
    arrayProd.push({
      title: commerce.productName(),
      price: commerce.price(100, 5000),
      thumbnail: image.technics(),
    });
  }
  console.log(arrayProd);
  var result = arrayProd;
  res.render("test", { products: result });
});

// Argumentos con minimist Desafio 14

var defport = {
  alias: { p: "port", m: "mode" },
  default: { m: "FORK", p: 8080 },
};

var objArguments = (0, _minimist2.default)(process.argv.slice(2), defport);
console.log(objArguments);
var PORT = objArguments.port;
var MODO = objArguments.mode;

// levantar server (el desafio 14 pide que se ingrese por consola y no por .env)

if (MODO === "CLUSTER" && _cluster2.default.isPrimary) {
  console.log("modo cluster");
  var _numCPUS = _os2.default.cpus().length;
  for (var i = 0; i < _numCPUS; i++) {
    _cluster2.default.fork(); //creamos los subprocesos
  }

  _cluster2.default.on("exit", function (worker) {
    console.log("El subproceso " + worker.process.pid + " fall\xF3");
    _cluster2.default.fork();
  });
} else {
  var server = app.listen(PORT, function () {
    return console.log("listening on port " + PORT);
  });
  // levantar servidor io
  var io = new _socket.Server(server);

  io.on(
    "connection",
    (function () {
      var _ref2 = _asyncToGenerator(
        /*#__PURE__*/ regeneratorRuntime.mark(function _callee4(socket) {
          return regeneratorRuntime.wrap(
            function _callee4$(_context4) {
              while (1) {
                switch ((_context4.prev = _context4.next)) {
                  case 0:
                    _context4.t0 = socket;
                    _context4.next = 3;
                    return productosApi.getAll();

                  case 3:
                    _context4.t1 = _context4.sent;

                    _context4.t0.emit.call(
                      _context4.t0,
                      "products",
                      _context4.t1
                    );

                    socket.on(
                      "newProduct",
                      (function () {
                        var _ref3 = _asyncToGenerator(
                          /*#__PURE__*/ regeneratorRuntime.mark(
                            function _callee2(data) {
                              return regeneratorRuntime.wrap(
                                function _callee2$(_context2) {
                                  while (1) {
                                    switch ((_context2.prev = _context2.next)) {
                                      case 0:
                                        _context2.next = 2;
                                        return productosApi.save(data);

                                      case 2:
                                        _context2.t0 = io.sockets;
                                        _context2.next = 5;
                                        return productosApi.getAll();

                                      case 5:
                                        _context2.t1 = _context2.sent;

                                        _context2.t0.emit.call(
                                          _context2.t0,
                                          "products",
                                          _context2.t1
                                        );

                                      case 7:
                                      case "end":
                                        return _context2.stop();
                                    }
                                  }
                                },
                                _callee2,
                                undefined
                              );
                            }
                          )
                        );

                        return function (_x2) {
                          return _ref3.apply(this, arguments);
                        };
                      })()
                    );

                    // lista de mensajes

                    //CHAT
                    //Envio de todos los mensajes al socket que se conecta.
                    _context4.t2 = io.sockets;
                    _context4.next = 9;
                    return normalizarMensajes();

                  case 9:
                    _context4.t3 = _context4.sent;

                    _context4.t2.emit.call(
                      _context4.t2,
                      "messages",
                      _context4.t3
                    );

                    //recibimos el mensaje del usuario y lo guardamos en el archivo chat.txt
                    socket.on(
                      "newMessage",
                      (function () {
                        var _ref4 = _asyncToGenerator(
                          /*#__PURE__*/ regeneratorRuntime.mark(
                            function _callee3(newMsg) {
                              return regeneratorRuntime.wrap(
                                function _callee3$(_context3) {
                                  while (1) {
                                    switch ((_context3.prev = _context3.next)) {
                                      case 0:
                                        _context3.next = 2;
                                        return chatApi.save(newMsg);

                                      case 2:
                                        _context3.t0 = io.sockets;
                                        _context3.next = 5;
                                        return normalizarMensajes();

                                      case 5:
                                        _context3.t1 = _context3.sent;

                                        _context3.t0.emit.call(
                                          _context3.t0,
                                          "messages",
                                          _context3.t1
                                        );

                                      case 7:
                                      case "end":
                                        return _context3.stop();
                                    }
                                  }
                                },
                                _callee3,
                                undefined
                              );
                            }
                          )
                        );

                        return function (_x3) {
                          return _ref4.apply(this, arguments);
                        };
                      })()
                    );

                  case 12:
                  case "end":
                    return _context4.stop();
                }
              }
            },
            _callee4,
            undefined
          );
        })
      );

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    })()
  );
}

const express = require("express");
const handlebars = require("express-handlebars");
const router = require("./src/routes/index");

// crear el server
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("hbs", handlebars.engine({ extname: "hbs" }));

app.set("view engine", "hbs");

app.set("views", "./src/views");

app.use(express.static("public"));

app.use("/", router);
// levantar server
app.listen(8080, () => console.log("server on port 8080"));

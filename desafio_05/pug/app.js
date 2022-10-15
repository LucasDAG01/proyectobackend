const express = require("express");
const path = require("path");
const router = require("./src/routes/index");

// crear el server
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", "./src/views");

app.use(express.static("public"));

app.use("/", router);
// levantar server
app.listen(8080, () => console.log("server on port 8080"));

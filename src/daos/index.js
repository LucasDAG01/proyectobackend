import { options } from "../config/dbConfig.js";
import { mdbModChart } from "../scripts/schChar.js";
import { mdbModProd } from "../scripts/schProd.js";

let ContenedorDaoProductos;
let ContenedorDaoCarritos;

//identificador
let databaseType = "mongo";

switch (databaseType) {
  case "archivos":
    const { ProductsDaoArchivos } = await import("./products/productsFiles.js");
    const { CartsDaoArchivos } = await import("./carts/cartsFiles.js");
    ContenedorDaoProductos = new ProductsDaoArchivos(
      options.fileSystem.pathProducts
    );
    ContenedorDaoCarritos = new CartsDaoArchivos(options.fileSystem.pathCarts);
    break;
  case "sql":
    const { ProductosDaoSQL } = await import("./products/productsSql.js");
    const { CarritosDaoSQL } = await import("./carts/cartsSql.js");
    ContenedorDaoProductos = new ProductosDaoSQL(options.sqliteDB, "productos");
    ContenedorDaoCarritos = new CarritosDaoSQL(options.sqliteDB, "carritos");
    break;
  case "mongo":
    const { ProductosDaoMongo } = await import("./products/productsMongo.js");
    const { CarritosDaoMongo } = await import("./carts/cartsMongo.js");
    ContenedorDaoProductos = new ProductosDaoMongo(options.mongoDB, mdbModProd);
    ContenedorDaoCarritos = new CarritosDaoMongo(options.mongoDB, mdbModChart);
    break;
}

export { ContenedorDaoProductos, ContenedorDaoCarritos };

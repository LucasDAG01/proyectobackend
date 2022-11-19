import { ContenedorMongo } from "../../managers/ContenedorMongo.js";

class ProductosDaoMongo extends ContenedorMongo {
  constructor(options, tableName) {
    super(options, tableName);
  }
}

export { ProductosDaoMongo };

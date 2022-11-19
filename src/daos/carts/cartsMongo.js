import { ContenedorMongo } from "../../managers/ContenedorMongo.js";

class CarritosDaoMongo extends ContenedorMongo {
  constructor(options, tableName) {
    super(options, tableName);
  }
}

export { CarritosDaoMongo };

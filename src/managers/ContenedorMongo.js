import mongoose from "mongoose";
import { options } from "../config/dbConfig.js";

const URL = options.mongoDB.databaseUrl;
mongoose.connect(
  URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error) throw new Error(`conection failed ${error}`);
    console.log("conection ok");
  }
);

class ContenedorMongo {
  constructor(options, tableName) {
    this.tableName = tableName;
  }
  async getAll() {
    try {
      let response = await this.tableName.find();
      console.log(response);
      let results = response.map((elm) => {
        if (elm.products) {
          return { ...elm, products: JSON.parse(elm.products) };
        } else {
          return { ...elm };
        }
      });
      return results;
    } catch (error) {
      return [];
    }
  }

  async save(product) {
    try {
      if (product) {
        let response = await this.tableName.insertMany(product);
        return { message: "guardado" };
      } else {
        return { message: "no se puede guardar un producto vacio" };
      }
    } catch (error) {
      return { message: `Error al actualizar, ${error}` };
    }
  }

  async getById(id) {
    try {
      let product = await this.tableName.find({ id: id });
      if (!product.length) {
        return {
          message: `Error al buscar: no se encontró el id ${id}`,
          error: true,
        };
      } else {
        if (product[0].products) {
          product[0].products = JSON.parse(product[0].products);
        }
        return { message: product[0], error: false };
      }
    } catch (error) {
      return { message: `Hubo un error ${error}`, error: true };
    }
  }

  async updateById(body, id) {
    try {
      if (body.products) {
        body.products = JSON.stringify(body.products);
      }
      let response = await this.tableName.updateOne({ id: id }, { $set: body });
      console.log(response);
      return { message: "Update successfully" };
    } catch (error) {
      return { message: `Error al actualizar: no se encontró el id ${id}` };
    }
  }

  async deleteById(id) {
    try {
      let result = await this.tableName.deleteMany({ id: id });
      if (result === 0) {
        return { message: `Error al borrar: No se encontro el id: ${id}` };
      } else {
        return { message: "delete successfully" };
      }
    } catch (error) {
      return { message: `Error al borrar: no se encontró el id ${id}` };
    }
  }

  async deleteAll() {
    try {
      await this.tableName.deleteMany();
      return { message: "delete successfully" };
    } catch (error) {
      return { message: `Error al borrar todo: ${error}` };
    }
  }
}

export { ContenedorMongo };

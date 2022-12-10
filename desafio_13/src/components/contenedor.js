import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class Contenedor {
  constructor(name) {
    this.name = path.join(__dirname, "../", `files/${name}`);
  }
  save = async (product) => {
    try {
      if (fs.existsSync(this.name)) {
        const content = await fs.promises.readFile(this.name, "utf-8");
        if (content) {
          const oldProducts = JSON.parse(content);
          const lastIdAdded = oldProducts.reduce(
            (acc, item) => (item.id > acc ? (acc = item.id) : acc),
            0
          );
          const newProduct = {
            id: lastIdAdded + 1,
            ...product,
          };
          oldProducts.push(newProduct);
          await fs.promises.writeFile(
            this.name,
            JSON.stringify(oldProducts, null, 2)
          );
        } else {
          const newProduct = {
            id: 1,
            ...product,
          };
          await fs.promises.writeFile(
            this.name,
            JSON.stringify([newProduct], null, 2)
          );
        }
      } else {
        const newProduct = {
          id: 1,
          ...product,
        };
        await fs.promises.writeFile(
          this.name,
          JSON.stringify([newProduct], null, 2)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  getById = async (id) => {
    try {
      if (fs.existsSync(this.name)) {
        const content = await fs.promises.readFile(this.name, "utf-8");
        if (content) {
          const product = JSON.parse(content);
          const products = product.find((item) => item.id === id);
          if (products) {
            return products;
          } else {
            return "no existe el id";
          }
        } else {
          return "El archivo esta vacio";
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  getAll = async () => {
    try {
      const content = await fs.promises.readFile(this.name, "utf-8");
      const productos = JSON.parse(content);
      return productos;
    } catch (error) {
      console.log(error);
    }
  };

  deleteById = async (id) => {
    try {
      const productos = await this.getAll();
      const newProducts = productos.filter((item) => item.id !== id);
      await fs.promises.writeFile(
        this.name,
        JSON.stringify(newProducts, null, 2)
      );
    } catch (error) {
      console.log(error);
    }
  };

  deleteAll = async () => {
    try {
      await fs.promises.writeFile(this.name, JSON.stringify([]));
    } catch (error) {
      console.log(error);
    }
  };

  updateById = async (id, body) => {
    try {
      const productos = await this.getAll();
      const productPos = productos.findIndex((elm) => elm.id === id);
      productos[productPos] = {
        id: id,
        ...body,
      };
      await fs.promises.writeFile(
        this.name,
        JSON.stringify(productos, null, 2)
      );
      return productos;
    } catch (error) {
      console.log(error);
    }
  };
}

export { Contenedor };

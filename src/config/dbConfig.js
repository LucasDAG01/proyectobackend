import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const options = {
  fileSystem: {
    pathProducts: "productos.json",
    pathCarts: "carritos.json",
  },
  sqliteDB: {
    client: "sqlite3",
    connection: {
      filename: path.join(__dirname, "../DB/ecommerce.sqlite"),
    },
    useNullAsDefault: true,
  },
  mongoDB: {
    databaseUrl:
      "mongodb+srv://Armslave:32191204@coderhouse.gnggjpm.mongodb.net/ecommerce?retryWrites=true&w=majority",
  },
};

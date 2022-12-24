import options from "../config/dbConfig.js";
import knex from "knex";
import { sqliteDB } from "../config/dbConfig.js";

// base con mysql

const dbmysql = knex(options.mariaDB);
const dbSqlite = knex(options.sqliteDB);

const createTables = async () => {
  try {
    // control de existencia de tabla mysql
    const tableProductsE = await dbmysql.schema.hasTable("products");
    if (tableProductsE) {
      await dbmysql.schema.dropTable("products");
    }
    // creamos tabla
    await dbmysql.schema.createTable("products", (table) => {
      // definimos campos
      table.increments("id"), table.string("title", 40).nullable(false);
      table.integer("price");
      table.string("thumbnail", 140);
    });
    console.log("se creo ok");
    dbmysql.destroy();

    const tableChatE = await dbSqlite.schema.hasTable("chat");
    if (tableChatE) {
      await dbSqlite.schema.dropTable("chat");
    }
    await dbSqlite.schema.createTable("chat", (table) => {
      table.increments("id");
      table.string("user", 30);
      table.string("timestamp", 20);
      table.string("message", 200);
    });
    console.log("chat creado");
    dbSqlite.destroy();
  } catch (error) {
    console.log(error);
  }
};

createTables();

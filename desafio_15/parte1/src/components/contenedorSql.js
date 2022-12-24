import knex from "knex";

class ContenedorSql {
  constructor(options, tableName) {
    this.databse = knex(options);
    this.tableName = tableName;
  }

  async getAll() {
    try {
      // select * from products
      const data = await this.databse.from(this.tableName).select("*");
      const products = data.map((elm) => ({ ...elm }));
      return products;
    } catch (error) {
      return `error ${error}`;
    }
  }
  async save(product) {
    try {
      const [productId] = await this.databse
        .from(this.tableName)
        .insert(product);
      return `nuevo producto id:${productId}`;
    } catch (error) {
      return `error ${error}`;
    }
  }
  async getById(id) {
    try {
      // consulta en base de datos con el where
      const data = await this.database.from(this.tableName).where("id", id);
      console.log(data);
      const products = data.map((elm) => ({ ...elm }));
      return products;
    } catch (error) {
      return `Hubo un error ${error}`;
    }
  }
}
export { ContenedorSql };

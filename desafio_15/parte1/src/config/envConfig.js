import * as dotenv from "dotenv";

dotenv.config(); //asigna las variables del archivo .env a process.env {PORT:"",MODO:""}

//creamos la configuracion de nuestra aplicacion
export const config = {
  DB_USERS: process.env.DB_USERS,
  DB_SESSION: process.env.DB_SESSION,
};

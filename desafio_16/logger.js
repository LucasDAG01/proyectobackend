import log4js from "log4js";
import { envConfig } from "./envConfig.js";

//configuracion de log4js
log4js.configure({
  appenders: {
    //definir las salidas de datos
    consola: { type: "console" },
    archivoWarn: { type: "file", filename: "./src/logs/warn.log" },
    archivoError: { type: "file", filename: "./src/logs/error.log" },
    //salidas con niveles definidos
    loggerConsola: {
      type: "logLevelFilter",
      appender: "consola",
      level: "info",
    },
    loggerWarn: {
      type: "logLevelFilter",
      appender: "archivoWarn",
      level: "warn",
    },
    loggerError: {
      type: "logLevelFilter",
      appender: "archivoError",
      level: "error",
    },
  },
  categories: {
    default: { appenders: ["loggerConsola"], level: "all" },
    produccion: {
      appenders: ["loggerConsola", "loggerWarn", "loggerError"],
      level: "all",
    },
  },
});

let logger = null;

if (envConfig.NODE_ENV === "prod") {
  logger = log4js.getLogger("produccion");
} else {
  logger = log4js.getLogger();
}

export { logger };

const mongoose = require("mongoose");
const winston = require("winston");
const app = require("./app");
const config = require("./config/config");

let server;

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

mongoose.connect(config.mongoose.url).then(
  () => {
    const logger = winston.createLogger({
      level: "info",
      transports: [new winston.transports.Console()],
    });

    logger.info("Connected to MongoDB");

    app.listen(config.port, () => {
      console.log("Server started at port  : " + config.port);
    });
  },
  () => {
     const logger = winston.createLogger({
       level: "error",
       transports: [new winston.transports.Console()],
     });
    logger.error("Cannot connect to mongoDB, please check your backend")
  }
);

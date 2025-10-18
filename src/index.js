const mongoose = require("mongoose");
const winston = require("winston");
const app = require("./app");
const config = require("./config/config");

let server;

mongoose
  .connect(config.mongoose.url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(
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
      logger.error("Cannot connect to mongoDB, please check your backend");
    }
  );

const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

const DEFAULT_WALLET_MONEY = 500;
const DEFAULT_PAYMENT_OPTION = "PAYMENT_OPTION_DEFAULT";
const DEFAULT_ADDRESSS = "ADDRESS_NOT_SET";

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    REACT_APP_NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    REACT_APP_PORT: Joi.number().default(3000),
    REACT_APP_MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    REACT_APP_JWT_SECRET: Joi.string().required().description("JWT secret key"),
    REACT_APP_JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.REACT_APP_NODE_ENV,
  port: envVars.REACT_APP_PORT,
  // Set mongoose configuration
  mongoose: {
    url: envVars.REACT_APP_MONGODB_URL + (envVars.REACT_APP_NODE_ENV === "test" ? "-test" : ""),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  default_wallet_money: DEFAULT_WALLET_MONEY,
  default_payment_option: DEFAULT_PAYMENT_OPTION,
  default_address: DEFAULT_ADDRESSS,
  jwt: {
    secret: envVars.REACT_APP_JWT_SECRET,
    accessExpirationMinutes: envVars.REACT_APP_JWT_ACCESS_EXPIRATION_MINUTES,
  },
};

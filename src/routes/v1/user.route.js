const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const useController = require("../../controllers/user.controller")
const auth = require("../../middlewares/auth");
const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`
console.log("User Router")
router.get("/:userId", validate(userValidation.getUser),  useController.getUser);



module.exports = router;

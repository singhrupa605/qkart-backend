const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const { use } = require("passport");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  return userCart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  const userCart = await Cart.findOne({ email: user.email });
  const productToAdd = await Product.findById(productId);

  if (!productToAdd) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }
  if (!userCart) {
    const newCart = await Cart.create({
      email: user.email,
      cartItems: [{ product: productToAdd, quantity: quantity }],
    });
    if (!newCart) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR);
    }

    return newCart;
  }
  const prod = userCart.cartItems.filter(
    (item) => item.product._id.toString() === productId
  );
  if (prod.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product already in cart. Use the cart sidebar to update or remove product from cart"
    );
  }
  const newProduct = { product: productToAdd, quantity: quantity };
  userCart.cartItems.push(newProduct);
  await userCart.save();
  return userCart;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const userCart = await Cart.findOne({ email: user.email });

  if (!userCart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  }
  const productToUpdate = await Product.findById(productId);
  if (!productToUpdate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }

  const prod = userCart.cartItems.filter(
    (item) => item.product._id.toString() === productId
  );
  if (!prod.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  const index = userCart.cartItems.indexOf(prod[0]);
  userCart.cartItems[index].quantity = quantity;
  await userCart.save();
  return userCart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  }
  const prod = userCart.cartItems.filter(
    (item) => item.product._id.toString() === productId
  );
  if (!prod.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  const index = userCart.cartItems.indexOf(prod[0]);
  userCart.cartItems.splice(index, 1);
  await userCart.save();
  return userCart;
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */

const checkout = async (user) => {
  const userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  if (!userCart.cartItems.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User cart is empty");
  }
  const isAddressPresent = await user.hasSetNonDefaultAddress();
  if (!isAddressPresent) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User address is not set");
  }
  //Calculating the cost of usercart items
  let totalCost = 0;
  userCart.cartItems.forEach((element) => {
    totalCost += element.product.cost * element.quantity;
  });
  if (user.walletMoney < totalCost) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "wallet balance is insufficient"
    );
  }
  user.walletMoney -= totalCost;
  const cartLength = userCart.cartItems.length;
  userCart.cartItems.splice(0, cartLength);
  return await userCart.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};

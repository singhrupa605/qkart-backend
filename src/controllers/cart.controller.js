const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");
const ApiError = require("../utils/ApiError");

/**
 * Fetch the cart details
 *
 * Example response:
 * HTTP 200 OK
 * {
 *  "_id": "5f82eebd2b11f6979231653f",
 *  "email": "crio-user@gmail.com",
 *  "cartItems": [
 *      {
 *          "_id": "5f8feede75b0cc037b1bce9d",
 *          "product": {
 *              "_id": "5f71c1ca04c69a5874e9fd45",
 *              "name": "ball",
 *              "category": "Sports",
 *              "rating": 5,
 *              "cost": 20,
 *              "image": "google.com",
 *              "__v": 0
 *          },
 *          "quantity": 2
 *      }
 *  ],
 *  "paymentOption": "PAYMENT_OPTION_DEFAULT",
 *  "__v": 33
 * }
 *
 *
 */
const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUser(req.user);
  res.send(cart);
});

/**
 * Add a product to cart
 *
 *
 */
const addProductToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addProductToCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );
  if (req.body.quantity < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "please enter a valid quantity");
  }
  res.status(httpStatus.CREATED).send(cart);
});

// TODO: CRIO_TASK_MODULE_CART - Implement updateProductInCart()
/**
 * Update product quantity in cart
 * - If updated quantity > 0,
 * --- update product quantity in user's cart
 * --- return "200 OK" and the updated cart object
 * - If updated quantity == 0,
 * --- delete the product from user's cart
 * --- return "204 NO CONTENT"
 *
 * Example responses:
 * HTTP 200 - on successful update
 * HTTP 204 - on successful product deletion
 *
 *
 */
const updateProductInCart = catchAsync(async (req, res) => {
  if (req.body.quantity > 0) {
    const updatedCart = await cartService.updateProductInCart(
      req.user,
      req.body.productId,
      req.body.quantity
    );
    res.send(updatedCart).status(httpStatus.OK);
  }
  if (req.body.quantity == 0) {
    await cartService.deleteProductFromCart(req.user, req.body.productId);
    res.sendStatus(httpStatus.NO_CONTENT);
  }
  if (req.body.quantity < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "please enter a valid quantity");
  }

  res.status(httpStatus.CREATED).send(cart);
});

/**
 * Checkout user's cart
 */
const checkout = catchAsync(async (req, res) => {
  const cart = await cartService.checkout(req.user);

  if (cart && cart.cartItems.length === 0) {
    
    res.status(httpStatus.NO_CONTENT).send(cart);
  } else {
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
});

module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
  checkout,
};
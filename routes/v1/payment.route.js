const express = require('express');
const { createPaymentIntent } = require('../../controllers/payment.controller');

const verifyToken = require('../../middlewares/verifyToken');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} /product All products
   * @apiDescription Get all the products
   * @apiPermission user
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [limit=10]  Users per page
   *
   * @apiSuccess {Object[]} all the tools.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .post(verifyToken, createPaymentIntent);

module.exports = router;

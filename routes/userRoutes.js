const express = require('express');
const authController = require('../controllers/auth');
const userController = require('../controllers/userController');
const {
  resizeOneImage,
  uploadOneImage,
  protect,
  uploadImages,
  resizeImages,
} = require('../utils/helpers');

const router = express.Router();

router.post('/sign_up', authController.signUp);

router.post('/login', authController.login);

router.use(protect);

router.get('/logOut', authController.logOut);

router.post('/checkout-session/:id', userController.stripeCheckout);

router.patch('/upload/:id', uploadOneImage, resizeOneImage, userController.addImage);

router.patch('/my_uploads/:id', uploadImages, resizeImages, userController.addImage);

router
  .route('/:id')
  .get(userController.findUser)
  .patch(userController.modifyUser)
  .delete(userController.removeUser);

module.exports = router;

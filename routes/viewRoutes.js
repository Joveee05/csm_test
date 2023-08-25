const express = require('express');
const viewsController = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../utils/helpers');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', isLoggedIn, viewsController.getOverview);

router.get('/login', isLoggedIn, viewsController.getLoginForm);

router.get('/signUp', viewsController.getSignUpForm);

router.get('/me', protect, viewsController.getAccount);

router.post('/submit-user-data', protect, viewsController.updateUserData);

module.exports = router;

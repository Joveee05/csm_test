const express = require('express');
const User = require('../utils/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { response, sendAccessToken } = require('../utils/helpers');
const Stripe = require('../stripe/stripe');

exports.signUp = catchAsync(async (req, res) => {
  const { fullName, email, password, passwordConfirm } = req.body;

  const user = await new User(fullName, email, password, passwordConfirm).signUp();

  const customer = await Stripe.addNewCustomer(email, fullName);
  sendAccessToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await new User().login(email, password, next);
  if (!user) return;
  sendAccessToken(user, 201, res);
});

exports.logOut = catchAsync(async (req, res) => {
  await new User().logOut(res);
  response('Logged out successfully', res, 200);
});

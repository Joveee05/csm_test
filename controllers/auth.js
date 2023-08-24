const express = require('express');
const User = require('../utils/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { response } = require('../utils/helpers');

exports.signUp = catchAsync(async (req, res) => {
  const { fullName, email, password, passwordConfirm } = req.body;

  const user = await new User(
    fullName,
    email,
    password,
    passwordConfirm
  ).signUp();

  response('User created', res, 201, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await new User().login(email, password, next);
  if (!user) return;
  response('Logged In successfully', res, 200, user);
});

exports.logOut = catchAsync(async (req, res) => {
  await new User().logOut(res);
  response('Logged out successfully', res, 200);
});

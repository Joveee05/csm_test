const express = require('express');
const User = require('../utils/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { response } = require('../utils/helpers');

exports.findUser = catchAsync(async (req, res, next) => {
  const user = await new User().getUser(req.params.id, next);
  response('User found', res, 200, user);
});

exports.modifyUser = catchAsync(async (req, res) => {
  const user = await new User().updateUser(req.params.id, req.body);
  response('User updated', res, 200, user);
});

exports.removeUser = catchAsync(async (req, res) => {
  const user = await new User().deleteUser(req.params.id);
  response('User deleted', res, 200);
});

exports.addImage = catchAsync(async (req, res) => {
  const id = req.params.id;
  const image = req.body.images;
  const user = await new User().updateImageArray(id, image);
  response('Image updated', res, 200, user);
});

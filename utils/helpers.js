const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./catchAsync');
const UserModel = require('../model/userModel');

const response = (message, res, statusCode, user) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data: user,
  });
};

const updateSubscription = async (id) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { subscription: true },
      { new: true }
    );
    if (user) {
      await user.save({ validateBeforeSave: false });
    } else {
      throw new Error('Inavlid userId');
    }
  } catch (error) {
    return { Error: `${error.message}` };
  }
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image. Please upload only images'), false);
  }
};

const resizeOneImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.body.images = [];

  const imageName = `image-${Math.round(Math.random() * 1e9)}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/${imageName}`);

  req.body.images.push(imageName);

  next();
});

const resizeImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  req.body.images = [];

  await Promise.all(
    req.files.map(async (file, i) => {
      const fileName = `image-${Math.round(Math.random() * 1e9)}-${Date.now()}-${
        i + 1
      }.jpeg`;

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/${fileName}`);

      req.body.images.push(fileName);
    })
  );
  next();
});

const uploadOneImage = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).single('image');

const uploadImages = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).any('images');

module.exports = {
  response,
  resizeOneImage,
  uploadOneImage,
  uploadImages,
  resizeImages,
  updateSubscription,
};

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { promisify } = require('util');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const UserModel = require('../model/userModel');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendAccessToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to proceed.', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('This user no longer exists.', 401));
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'This user recently changed password. Please log in with new password.',
        401
      )
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await UserModel.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

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
}).single('images');

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
  sendAccessToken,
  protect,
  isLoggedIn,
};

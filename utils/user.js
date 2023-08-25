const multer = require('multer');
const UserModel = require('../model/userModel');
const AppError = require('../utils/appError');
const { uploadOneImage } = require('./helpers');

module.exports = class User {
  constructor(fullName, email, password, passwordConfirm) {
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.passwordConfirm = passwordConfirm;
  }

  async signUp() {
    const payload = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      passwordConfirm: this.passwordConfirm,
    };
    const user = await UserModel.create(payload);
    return user;
  }

  async login(email, password, next) {
    if (!email || !password) {
      return next(new AppError('Please enter email and password', 400));
    }

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
    return user;
  }

  async getUser(id, next) {
    const user = await UserModel.findById(id);
    if (!user) {
      return next(new AppError('No user found', 404));
    }
    return user;
  }

  async updateUser(id, payload) {
    const user = await UserModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new Error('User update failed');
    }
    const modifiedUser = await user.save();
    return modifiedUser;
  }

  async deleteUser(id) {
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      throw new Error('No user found with this ID');
    }
  }

  async updateImageArray(id, payload) {
    const image = await UserModel.findByIdAndUpdate(id, {
      $push: { images: payload },
    });
    return image;
  }

  async logOut(res) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
  }
};

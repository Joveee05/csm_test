const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'A user must have an email address'],
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: 'default.jpg',
    },
    images: [
      {
        type: String,
      },
    ],
    subscription: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
      select: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
    },
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

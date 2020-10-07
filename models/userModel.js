// Core modules
const crypo = require("crypto");
// Third party modules
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    trim: true,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "A password must have more or equal than 8 characters"],
    // This is important, dont leak the password even if its encripted
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    // This only works on save and create
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  photo: {
    type: String,
    default: "default.jpg",
  },
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Password confirm is a required input, but not in the database.
  // Delete password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // This is to ensure that the token has been created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Only show active users
userSchema.pre(/^find/, function (next) {
  // This points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance method, will be availible to every document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const modifiedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < modifiedTimestamp; // 300 < 200
  }

  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypo.randomBytes(32).toString("hex");
  this.passwordResetToken = crypo
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

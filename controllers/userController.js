// Third party modules
const multer = require("multer");
const sharp = require("sharp");
// Dev modules
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// Multer setup
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     // user-345983475345-34587345783455.jpeg
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeuserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 85 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// Functions
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if the user tries to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "You can not change password on this route. Use /updateMyPassword",
        400
      )
    );

  // Filter keys that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined, please use /signup instead!",
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllusers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// Do not update passwords with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

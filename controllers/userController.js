const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

// const multerStorage = multer.diskStorage({
//   destination: (req, res, callback) => {
//     // callback first argument to send an error if something goes wrong
//     callback(null, "public/img/users");
//   },
//   filename: (req, file, callback) => {
//     const ext = file.mimetype.split("/")[1];
//     callback(null, `user-${req.user.id}- ${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(
      new AppError("Not an image! Please upload only images.", 400),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500) // width, height
    .toFormat("jpeg") // format
    .jpeg({ quality: 90 }) // jpeg options
    .toFile(`public/img/users/${req.file.filename}`); // destination

  next();
});

//          DO FILTER ON REQUEST BODY /////////////////////////////////////
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) newObj[field] = obj[field];
  });
  return newObj;
};

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: "succsess",
//     results: users.length,
//     data: users,
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 create  error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. please use /updateMyPassword.",
        400,
      ),
    );
  }
  // 2 filter out unwanted fields names that are not allowed to be updated.
  // the next two lines are the same
  const filterdBody = filterObj(req.body, "name", "email");
  // const { name, email } = req.body;
  if (req.file) {
    filterdBody.photo = req.file.filename;
  }
  // 3 update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    // { name, email },
    filterdBody,
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: "success", data: null });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined!! Please use /signup instead",
  });
};
// DO NOT UPDATE PASSWORD WITH THIS!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);

const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    data: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user", // fields that we want to show on detail page
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name", 404));
  }

  res
    .status(200)
    .set(
      "Content-Security-Policy",
      "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
    )
    .render("tour", {
      title: `${tour.name} Tour`,
      data: tour,
    });
});

exports.getLogin = (req, res) => {
  res
    .status(200)
    .set("Content-Security-Policy", "connect-src 'self' http://localhost:3001/")
    .render("login", {
      title: "Log into your account",
    });
};

exports.getSignup = (req, res) => {
  res
    .status(200)
    .set("Content-Security-Policy", "connect-src 'self' http://localhost:3001/")
    .render("signup", {
      title: "create your account",
    });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render("overview", {
    title: "My tours",
    data: tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log("UPDATING USER DATA :", req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true, // return the new document
      runValidators: true,
    },
  );
  res.status(200).render("account", {
    title: "Your account",
    user: updatedUser, // need the new user data
  });
});

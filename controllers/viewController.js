const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();
  // Render template using data
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name.", 404));
  }

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // Find tours with those ID's
  const tourIDs = bookings.map((el) => el.tour);
  // $in find all IDs which are in tourIDs array
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

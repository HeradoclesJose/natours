const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must above 1.0"],
      max: [5, "Rating must below 5.0"],
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must have a tour!"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must have an user!"],
    },
  },
  {
    // This is used to save the virtual field in the data base.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  // .populate({
  //   path: "tour",
  //   select: "name",
  // });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].nRating,
      ratingsQuantity: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // This points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// We have to do it this way to get access to the data
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

// After saving the document we can perform the calculation
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

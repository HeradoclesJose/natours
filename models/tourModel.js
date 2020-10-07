const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have more or equal than 10 characters"],
      // Example of using a custom library
      // validate: [
      //   validator.isAlpha,
      //   "A tour name must only contains characters",
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must above 1.0"],
      max: [5, "Rating must below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Only works when creating a new document, not on update
          return val < this.price; // 100 < 200
        },
        message: "Discount price({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // Hiding created date
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    // This is used to save the virtual field in the data base.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
// This is for geo queries
tourSchema.index({ startLocation: "2dsphere" });

// This won't be saved on the data base, as it is a virtual property, you have to pass an option to the schema
// This can be useful to separate app and business logic
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Virtual populate, to get the data without persisting it to the data base, so the array wont grow
// foreing field: where the id is stored
// local field: the reference that the child document uses to reference the parent
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// DOCUMENT MIDDLEWARE, Runs before .save() and .create(), but not before insertMany()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middleware, its used on every find, find one, etc methods.
// tourSchema.pre(/^find/, function (next) {
//   // tourSchema.pre("find", function (next) {
//   this.find({ secretTour: { $ne: true } });
//   // this.star = Date.now();
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt -active",
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
// console.log(`Query took ${Date.now() - this.start} milliseconds!`);
// console.log(docs);
// next();
// });

// Aggregation middleware
tourSchema.pre("aggregate", function (next) {
  const pipeline = this.pipeline()[0];
  if (Object.keys(pipeline)[0] !== "$geoNear") {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;

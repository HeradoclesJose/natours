// Required modules
const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

// ENV VARS
dotenv.config({ path: "./config.env" });

// DB String
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// DB Connection
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Reading the file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

const uploadDocs = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data was uploaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete All data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log("Data was deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  uploadDocs();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

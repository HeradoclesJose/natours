// Core modules
const path = require("path");
// Third party packages
const morgan = require("morgan");
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
// Dev packages
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
// Routers
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");

// Express variables
const app = express();

// Global middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many request from this IP, please try again in an hour",
  statusCode: 429,
});

// Set pug as default view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// CORS
app.use(cors());
app.options("*", cors());
// Serving static files
app.use(express.static(path.join(__dirname, "public")));
// Set security http headers
app.use(helmet());
// Enable if you are behind a reverse proxy
app.set("trust proxy", 1);
// Limit requests to API
app.use("/api", limiter);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
// Cookie parser, reads data from cookies
app.use(cookieParser());
// Data sanitization against NoSQL query Injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/", viewRouter);

// Remember, everything is a middleware and the order matters. So if we put here a route handler for unwanted routes, its going to be handled.
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// By using these four parameters express knows its an err middleware
app.use(globalErrorHandler);

module.exports = app;

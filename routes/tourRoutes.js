// Third party modules
const express = require("express");
// Dev modules
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");
// Setting up the router
const router = express.Router();

// Params middleware
// router.param("id", tourController.checkId);

// Routes

router
  .route("/top-5")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

// POST /tour/234dsh/reviews
// GET /tour/234dsh/reviews
// Nested routes with merged params
router.use("/:tourId/reviews", reviewRouter);

// Exporting the router
module.exports = router;

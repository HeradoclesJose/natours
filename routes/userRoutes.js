// Third party modules
const express = require("express");
// Dev modules
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// Setting up the router
const router = express.Router();

// Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// This will run for every route after this point.
router.use(authController.protect);

router.patch("/updateMyPassword/", authController.updatePassword);
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeuserPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);
router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllusers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

//Exporting router
module.exports = router;

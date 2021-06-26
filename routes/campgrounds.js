const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware.js");

router
  .route("/")
  .get(campgrounds.index)
  .post(
    isLoggedIn,
    upload.array("images"),
    validateCampground,
    catchAsync(campgrounds.createCampgrounds)
  );

// .post(
//   isLoggedIn,
//   validateCampground,
//   catchAsync(campgrounds.createCampgrounds)
// );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(campgrounds.showCampgrounds)
  .put(
    isLoggedIn,
    upload.array("images"),
    validateCampground,
    isAuthor,
    catchAsync(campgrounds.updateCampgrounds)
  )
  .delete(isLoggedIn, isAuthor, campgrounds.deleteCampgrounds);

router.get("/:id/edit", isLoggedIn, isAuthor, campgrounds.editCampgrounds);

module.exports = router;

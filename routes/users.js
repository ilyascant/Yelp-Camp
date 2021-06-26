const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const users = require("../controllers/users");

router
  .route("/register")
  .get((req, res) => {
    res.render("campgrounds/register");
  })
  .post(catchAsync(users.newUser));

router
  .route("/login")
  .get((req, res) => {
    res.render("campgrounds/login");
  })
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.loginUser
  );

router.route("/logout").post(users.logoutUser).get(users.renderLogout);

module.exports = router;

const User = require("../models/user");

module.exports.newUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    // console.log(req.flash("error"));
    res.redirect("register");
  }
};

module.exports.loginUser = (req, res) => {
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  req.flash("success", "Welcome Back");
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  // req.session.user_id = null;
  req.session.destroy();
  res.redirect("/campgrounds");
};

module.exports.renderLogout = (req, res) => {
  req.logout();
  req.flash("success", "Successfully Loged Out");
  res.redirect("/campgrounds");
};

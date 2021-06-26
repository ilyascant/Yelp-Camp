if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
// const Joi = require("joi");
const session = require("express-session");
const flash = require("connect-flash");
// const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const User = require("./models/user");
const AppError = require("./utils/AppError");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
// const session = require("")
const MongoDBStore = require("connect-mongo");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
// const dbUrl = "mongodb://localhost:27017/yelp-camp";

// ---> DATABASE CONNECTION

const PORT = process.env.PORT || 3000;
const db = mongoose.connection;
app.listen(PORT, () => {
  console.log(`Serving on PORT: ${PORT}`);
});

mongoose.connect(dbUrl, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database CONNECTED");
});

// ---> USE & SET

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(mongoSanitize());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const secret = process.env.SECRET || "thisismysecret";

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
];

const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://cdn.jsdelivr.net/npm/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];

const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];

const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", , ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/disur0e1o/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.messages = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ---> ROUTES

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new AppError("NOT FOUND", 404));
});

app.use((err, req, res, nex) => {
  const { status = 500, message = "Something Went Wrong" } = err;
  res.render("error", { err });
});

// ----------------------------------------------------------------

// ---> COOKIES

// app.get("/cookie", (req, res) => {
//   res.cookie("name", "ilyas can turali");
//   res.send("do you want some cookies");
// });

// app.get("/getsignedcookie", (req, res) => {
//   res.cookie("fruit", "grape", { signed: true });
//   res.send("SIGNED YOUR FRUIT COOKIE");
// });

// ---> BCYRPT

// const hashPassword = async (pw) => {
//   const salt = await bcrypt.genSalt(12);
//   const hash = await bcrypt.hash(pw, salt);
//   console.log(salt);
//   console.log(hash);
// };

// const hashPassword = async (pw) => {
//   const hash = await bcrypt.hash(pw, 12);
//   return hash;
// };

// const login = async (pw, hashedPassword) => {
//   const result = await bcrypt.compare(pw, hashedPassword);
//   return result;
// };

// hashPassword("monki");
// login("monki", "$2b$12$PEK2zlUa8KasdvesUceqF.ws0OX2KbQzKzAPRFK1oYJErBG4pvTbi");

// --->  OTHERS

// app.get("/search", (req, res) => {
//   // http://127.0.0.1:3000/search?q=selam
//   res.send(req.query);
// });

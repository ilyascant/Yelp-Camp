const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.showCampgrounds = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  res.render("campgrounds/show", { campground });
};

module.exports.createCampgrounds = async (req, res, next) => {
  const geoData = await geoCoder
    .forwardGeocode({
      query: req.body.location,
      limit: 1,
    })
    .send();
  const newCampground = new Campground(req.body);
  newCampground.geometry = geoData.body.features[0].geometry;
  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCampground.author = req.user._id;
  await newCampground.save();
  console.log(newCampground);
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.editCampgrounds = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampgrounds = async (req, res, next) => {
  const { id } = req.params;
  const updatedCampground = await Campground.findByIdAndUpdate(id, {
    ...req.body,
  });

  const geoData = await geoCoder
    .forwardGeocode({
      query: req.body.location,
      limit: 1,
    })
    .send();
  updatedCampground.geometry = geoData.body.features[0].geometry;
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  updatedCampground.images.push(...imgs);
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await updatedCampground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  await updatedCampground.save();
  req.flash("success", "Succesfully updated campground!");
  res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCampgrounds = async (req, res) => {
  console.log(req.params.id);
  await Campground.findByIdAndDelete(req.params.id);
  res.redirect("/campgrounds");
};

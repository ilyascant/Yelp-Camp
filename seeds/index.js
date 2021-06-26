const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

const db = mongoose.connection;

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database CONNECTED");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 30; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "60bc0d628b4e8336d4e15d7e",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit, soluta natus explicabo veniam amet facilis nostrum, reprehenderit eveniet ut dicta impedit consequuntur rerum vel ratione, maiores ex perferendis saepe odio.",
      price: price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/disur0e1o/image/upload/v1623275787/437173820_750x422_netyq9.png",
          filename: "jmo9uy49kfi9fio5mj0f",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
  console.log("Database DISCONNECTED");
});

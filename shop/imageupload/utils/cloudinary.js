const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "pumkin",
  api_key: "439527927618787",
  api_secret: "h_5OyM6UhpNvt69DtAdJh48tbso",
});

module.exports = cloudinary;

const express = require("express");
const joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 8000;
const uploader = require("./middlewares/uploader");
const cloudinary = require("./utils/cloudinary");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const imageUploadSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
});

const Image = mongoose.model("Image", imageUploadSchema);

const validate = (content) => {
  const schema = joi.object({
    title: joi.string().required(),
  });

  return schema.validate(content);
};

app.get("/", async (req, res) => {
  const images = await Image.find();

  res.json({ images });
});

app.post("/", uploader.single("image"), async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).json({ mesage: error.details[0].message });

  const imagePath = await cloudinary.v2.uploader.upload(req.file.path);

  const image = new Image({
    title: req.body.title,
    image: imagePath.secure_url,
  });

  await image.save();
  res.json({ message: "success", image });
});

mongoose
  .connect("mongodb://localhost/imageUp")
  .then(() => {
    app.listen(PORT, () => console.log(`server running on PORT - ${PORT}`));
  })
  .catch((error) => console.log(error));

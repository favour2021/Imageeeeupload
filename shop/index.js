const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const joi = require("joi");
const PORT = process.env.PORT || 2003;
const { Schema } = require("mongoose");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

const shopSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Items = mongoose.model("Shopping", shopSchema);

const validate = (shop) => {
  const schema = joi.object({
    image: joi.string().required(),
    title: joi.string().min(3).required(),
    amount: joi.number().min(3).required(),
    description: joi.string().min(5).required(),
  });

  return schema.validate(shop);
};

app.get("/", async (req, res) => {
  const shops = await Items.find();
  res.json({ shops });
});

app.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).json({ mesage: error.details[0].message });

  const item = await new Items({
    image: req.body.image,
    title: req.body.title,
    amount: req.body.amount,
    description: req.body.description,
  });

  await item.save();

  res.status(201).json({ message: "successful", item });
});

app.get("/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  const item = await Items.findById(itemId);
  if (!item) return res.status(400).json({ message: "Product not found..." });

  res.json({ message: "success", item });
});

app.put("/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  const { error } = validate(req.body);
  if (error) return res.status(400).json({ mesage: error.details[0].message });

  const item = await Items.findById(itemId);
  if (!item)
    return res.status(400).json({ message: "Product with ID not found .." });

  item.title = req.body.title;
  item.amount = req.body.amount;
  item.description = req.body.description;

  await item.save();

  res.json({ message: "updated", item });
});

app.delete("/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  const item = await Items.findById(itemId);
  if (!item)
    return res.status(400).json({ message: "Product with id not found." });

  await Items.deleteOne({ _id: itemId });

  res.json({ message: "deleted Successfully" });
});
mongoose
  .connect("mongodb://localhost/shoppingcart")
  .then(() => {
    console.log("database connection established");
    app.listen(PORT, () => console.log(`server running at port -- ${PORT}`));
  })
  .catch((err) => console.log(err));

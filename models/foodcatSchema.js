const mongoose = require("mongoose");

const foodcatSchema = new mongoose.Schema({
  catagoryName: {
    type: String,
    required: true,
  },
});

const foodCatSchema = mongoose.model("foodCatSchema", foodcatSchema);
module.exports = foodCatSchema;

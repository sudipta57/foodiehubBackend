const mongoose = require("mongoose");

const foodcatSchema = new mongoose.Schema({
  CategoryName: {
    // Change 'categoryName' to 'foodcat'
    type: String,
    required: true,
  },
});
const foodCatSchema = mongoose.model("foodCatSchema", foodcatSchema);
module.exports = foodCatSchema;

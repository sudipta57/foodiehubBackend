const mongoose = require("mongoose");

const foodDataSchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  options: [
    {
      half: {
        type: String,
        required: true,
      },
      full: {
        type: String,
        required: true,
      },
    },
  ],
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number, // Assuming quantity is a number
    default: 1, // Default value of quantity is 0
  },
});

const foodData = mongoose.model("foodDatacol", foodDataSchema);
module.exports = foodData;

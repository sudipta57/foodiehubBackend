const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb://sudipta:passwordsudipta@localhost:27017/foodapp",
      {
        useNewUrlParser: true,
      }
    );
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

const fetchResturantData = async () => {
  try {
    // Access the resturantinfo collection
    const resturantinfoCollection =
      mongoose.connection.db.collection("resturantinfo");

    // Fetch data from the collection
    const resturantData = await resturantinfoCollection.find({}).toArray();

    return resturantData; // Return the data for further use if needed
  } catch (error) {
    console.error("Error fetching resturant data:", error);
    throw error; // Propagate the error if needed
  }
};

module.exports = {
  connectToDatabase,
  fetchResturantData,
};

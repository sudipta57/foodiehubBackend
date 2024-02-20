const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ghoramiswapna32:sC0UOFqg0zDLbGIU@cluster0.acvase5.mongodb.net/foodapp",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true, // Add this option to use the new Server Discover and Monitoring engine
      }
    );
    console.log("Connection to MongoDB successful");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

const fetchRestaurantData = async () => {
  try {
    // Access the restaurantinfo collection
    const restaurantinfoCollection =
      mongoose.connection.db.collection("restaurantinfo");

    // Fetch data from the collection
    const restaurantData = await restaurantinfoCollection.find({}).toArray();

    return restaurantData; // Return the data for further use if needed
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    throw error; // Propagate the error if needed
  }
};

module.exports = {
  connectToDatabase,
  fetchRestaurantData,
};

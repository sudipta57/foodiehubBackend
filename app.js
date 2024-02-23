const express = require("express");
const app = express();
const cors = require("cors");
const cookieparser = require("cookie-parser");
app.use(express.json());

app.use(
  cors({
    origin: "https://foodiehub-goodfood.netlify.app",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use("/uploads", express.static("uploads"));

app.use(cookieparser());
app.use(express.urlencoded({ extended: false }));
//user routes
const authRoutes = require("./routes/userAuth");
app.use("/api", authRoutes);
//resturant routes
const resturantRoutes = require("./routes/resturantsAuth");
app.use("/api", resturantRoutes);
const { connectToDatabase } = require("./db/connection");

// Connect to the database
connectToDatabase();
app.listen(3000, () => {
  console.log("server is running on port 3000");
});

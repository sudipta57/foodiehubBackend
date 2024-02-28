const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectToDatabase } = require("./db/connection");

// Connect to the database
connectToDatabase();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://foodiehubfrontend.vercel.app", "http://localhost:5173"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Routes
const authRoutes = require("./routes/userAuth");
app.use("/api", authRoutes);

const resturantRoutes = require("./routes/resturantsAuth");
app.use("/api", resturantRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

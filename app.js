const express = require("express");
const session = require("express-session");
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
    origin: "https://foodiehubfrontend.vercel.app",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: "your_secret_key_here_sudipta57",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      maxAge: 3600000,
      httpOnly: true,
      domain: "foodiehubfrontend.vercel.app",
    }, // adjust cookie settings as needed
  })
);

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

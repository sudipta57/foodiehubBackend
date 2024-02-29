const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const nodemailer = require("nodemailer");
const upload = multer({ storage });

// app.js or wherever you want to use the database connection
const { fetchRestaurantData } = require("../db/connection");

const Resturant = require("../models/resturentSchema");
const foodData = require("../models/foodData");
const foodCatSchema = require("../models/foodcatSchema");
const { default: mongoose } = require("mongoose");
router.get("/resturanthome", (req, res) => {
  res.send("hello from the home of the backend");
});

router.post("/resturantregistration", async (req, res) => {
  const { name, email, phone, address, password, cpassword } = req.body;
  if (!name || !email || !phone || !address || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill in the data" });
  }

  // Check by email if the user exists
  const resturantExist = await Resturant.findOne({ email: email });
  if (resturantExist) {
    return res.status(422).json({ error: "User already exists" });
  } else if (password !== cpassword) {
    return res.status(422).json({ error: "Passwords don't match" });
  } else {
    const resturant = new Resturant({
      name,
      email,
      phone,
      address,
      password,
      cpassword,
    });
    try {
      const resturantSave = await resturant.save();

      if (resturantSave) {
        return res
          .status(201)
          .json({ message: "User registered successfully" });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    } catch (error) {
      console.error(error);
    }
  }
});
//sending secret code to the resturantregistration client

router.get("/getcode", async (req, res) => {
  const getsecretcodecollection =
    mongoose.connection.db.collection("resturantcoded");

  // fetch the data from the array
  const seccode = await getsecretcodecollection.find({}).toArray();
  if (!seccode) {
    return res.status(422).json({ error: "Error in secret code finding" });
  } else {
    return res
      .status(200)
      .json({ seccode, message: "Code fetched Successfully" });
  }
});

router.post("/resturantlogin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please fill in the inputs" });
  }
  try {
    const resturantExist = await Resturant.findOne({ email: email });
    if (!resturantExist) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    // Compare the password
    const resturantPassword = await bcrypt.compare(
      password,
      resturantExist.password
    );
    if (!resturantPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    } else {
      const token = await resturantExist.generateAuthToken(res);
      if (token) {
        req.resemail = email;

        return res.status(200).json({ message: "Login successfully" });
      }
      return res.status(402).json({ error: "token not provided" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/resturantdata", async (req, res) => {
  // Fetch data from the resturantinfo collection
  const resturantData = await fetchRestaurantData();

  // Send the data as a JSON response
  res.json(resturantData);
});

// Saving food data to the database from the client
router.post(
  "/insertFoodData",

  upload.single("image"),
  async (req, res) => {
    try {
      const { CategoryName, foodname, pricehalf, pricefull, description } =
        req.body;
      if (
        !req.file ||
        !CategoryName ||
        !foodname ||
        !pricehalf ||
        !pricefull ||
        !description
      ) {
        return res
          .status(400)
          .json({ error: "Upload and check all the files." });
      }

      const imagePath = `./public/${Date.now()}-${req.file.originalname}`;
      // Move the uploaded file to the specified path
      fs.renameSync(req.file.path, imagePath);

      // Sample data to insert
      const sampleFoodData = {
        CategoryName: CategoryName,
        name: foodname,
        img: imagePath,
        description: description,
        options: [
          {
            half: pricehalf,
            full: pricefull,
          },
          // Add more options if needed
        ],
      };
      const findFoodCategory = await foodCatSchema
        .findOne({ CategoryName })
        .exec();
      if (!findFoodCategory) {
        await foodCatSchema.create({
          CategoryName,
        });
        console.log("found");
        // Insert the sample data into the FoodData collection
        const result = await foodData.create(sampleFoodData);

        res.status(200).json({ message: "File uploaded successfully", result });
      } else {
        // Insert the sample data into the FoodData collection
        const result = await foodData.create(sampleFoodData);

        res
          .status(200)
          .json({ message: "File uploadedss successfully", result });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/resturantmenu", async (req, res) => {
  const resturantData = await foodData.find();
  const resturantDataWithImgPath = resturantData.map((item) => ({
    ...item._doc, // spread all existing properties of the item
    imgPath: `https://foodiehub-backend.vercel.app/${item.img}`,
  }));

  // Send the data as a JSON response
  res.json(resturantDataWithImgPath);
});

// // Sending food categories
// router.get("/foodcatagory",  async (req, res) => {
//   // Fetching food data
//   // Sending food data
//   res.json(foodcatagory);
// });

// Sending food categories
router.get("/foodcatagory", async (req, res) => {
  // Fetching food data
  const foodcatagory = await foodCatSchema.find();
  // Sending food data
  res.json(foodcatagory);
});

// Logout
router.post("/resturantlogout", async (req, res) => {
  const { email } = req.body;
  try {
    // Find the user by email or however you identify the user
    const user = await Resturant.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove all tokens from the user
    user.tokens = [];
    await user.save();

    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// creating route for email verification of resturant

router.post("/createresotp", (req, res) => {
  const generateotp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  };
  const otp = generateotp();
  // sending otp via email
  const { email } = req.body;

  // creating a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ghoramisudipta32@gmail.com",
      pass: "cgneqnkwuurzlnrr",
    },
  });
  //construct email message
  const mailOptions = {
    from: "ghoramisudipta32@gmail.com",
    to: email,
    subject: "OTP for registration",
    text: `Dear User,

    Thank you for using our service. Your One-Time Password (OTP) for registration is:
    
    ${otp}
    
    Please use this OTP within the next 5 minutes to complete your login process.
    
    If you did not request this OTP, please ignore this email.
    
    Best regards,
    [Foodie hunter]`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      res.json({ otp, message: "mail sent" }); // Sending OTP along with success message
      // return res.status(200).json({ message: "mail sent" });
    }
  });
});

//sending order details to the resutrant

router.post("/sendOrderToResturant", (req, res) => {
  const { price, foodname, foodquantity } = req.body;
  console.log(price, foodname, foodquantity);
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ghoramisudipta32@gmail.com",
      pass: "cgneqnkwuurzlnrr",
    },
  });
  //constract email message

  const mailOptions = {
    from: "ghoramisudipta32@gmail.com",
    to: "ghoramisudipta32@gmail.com",
    subject: "New order recieved",
    text: `
    Dear Restaurant,
    
    We're excited to inform you that a new order has been received!
    
    Order Details:
    - Food Name: [${foodname}]
    - Quantity: [${foodquantity}]
    - Total Amount: [${price}]
    
    Please review the details and prepare the order accordingly.
    
    Best regards,
    `,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      res.json({ message: "mail sent" });
    }
  });
});

module.exports = router;

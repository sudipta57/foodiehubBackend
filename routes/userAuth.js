const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const Razorpay = require("razorpay");
const router = express.Router();
const bcrypt = require("bcrypt");
require("../db/connection");
const User = require("../models/userSchema");
const Payment = require("../models/paymentschema");
const authenticate = require("../middleware/authenticate");
const crypto = require("crypto");
const razorpay = new Razorpay({
  key_id: "rzp_test_jMM8QdP7ZQhqoM",
  key_secret: "hQQAdPsXlhbJICSzLGfwLfZB",
});

// Create Order Endpoint
router.post("/create-payment", async (req, res) => {
  const { price } = req.body;
  function generateReceiptId() {
    // Logic to generate a unique ID, such as using a UUID library or timestamp-based ID
    return "receipt_" + Math.random().toString(36).substr(2, 9);
  }
  const options = {
    amount: price * 100, // Amount in paisa
    currency: "INR",
    receipt: generateReceiptId(), // Unique receipt ID
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json(response);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});
//checkout payment
router.post("/paymentverification", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedsignature = crypto
    .createHmac("sha256", "hQQAdPsXlhbJICSzLGfwLfZB")
    .update(body.toString())
    .digest("hex");
  const isauth = expectedsignature === razorpay_signature;
  if (isauth) {
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    res.redirect(
      `http://localhost:5173/paymentsuccess?referance${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({ success: false });
  }
});

router.post("/registration", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;
  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill the datas" });
  }
  // check by email if the user exist
  const userExist = await User.findOne({ email: email });
  if (userExist) {
    return res.status(500).json({ error: "User already exists by your email" });
  } else if (password !== cpassword) {
    return res.status(422).json({ error: "Password isn't matching" });
  } else {
    const user = new User({
      name,
      email,
      phone,
      work,
      password,
      cpassword,
    });
    try {
      const userSaved = await user.save();
      if (userSaved) {
        return res
          .status(201)
          .json({ message: "User registered successfully" });
      } else {
        return res.status(500).json({ error: "Internel server error" });
      }
    } catch (error) {
      console.error(error);
    }
  }
});

//route for otp genarating
router.post("/createotp", (req, res) => {
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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "please fill the inputs" });
  }
  try {
    const userExist = await User.findOne({ email: email });
    if (!userExist) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    //comapre the password
    const userPasword = await bcrypt.compare(password, userExist.password);
    if (!userPasword) {
      return res.status(401).json({ error: "Invalid email or password" });
    } else {
      const token = await userExist.generateAuthToken(res);
      if (token) {
        req.email = email;
        return res.status(200).json({ message: "Login successfully" });
      }
      return res.status(402).json({ error: "token not provided" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Interval server error" });
  }
});
router.get("/getdata", (req, res) => {
  try {
    res.json(req.rootuser);
  } catch (error) {
    console.error(error);
  }
});
//contact
router.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  try {
    if (!name || !email || !phone || !message) {
      return res.status(500).json({ error: "Error in contact form" });
    }
    // creating a nodemailer transporter

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "ghoramisudipta32@gmail.com",
        pass: "cgneqnkwuurzlnrr",
      },
    });

    // construct email message

    const mainOptions = {
      from: email,
      to: "ghoramisudipta32@gmail.com", // Specify recipient's email address
      subject: "Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    };

    // send the email

    transporter.sendMail(mainOptions, (error, info) => {
      if (error) {
        console.error("Error sending email", error);
        res.status(500).json({ error: "error sending email" });
      } else {
        res.status(200).json({ message: " sending email successed" });
      }
    });
  } catch (error) {
    console.log(error);
  }
});
//logout
router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logged Out Successful" });
});
router.get("/working", (req, res) => {
  res.json({ message: "demo" });
});
// router.post("/initiatepayment",  async (req, res) => {
//   const { orderid } = req.body;
//   try {
//     // Perform any additional logic if needed (e.g., calculating total amount to charge)
//     // Then, initiate payment and get payment ID from Razorpay
//     const response = await razorpay.orders.fetchPayments(orderid);
//     if (!response) {
//       return res.status(500).json({ error: "Payment is not found" });
//     }
//     const paymentId = response.id; // Assuming you get payment ID from Razorpay
//     console.log(response);
//     res.json({ paymentId });
//   } catch (error) {
//     console.error("Error initiating payment:", error);
//     res.status(500).json({ message: "Failed to initiate payment" });
//   }
// });

module.exports = router;

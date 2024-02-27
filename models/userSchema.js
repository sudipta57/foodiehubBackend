const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  work: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
//hashing the password
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      const hashpass = await bcrypt.hash(this.password, 12);
      this.password = hashpass;
      this.cpassword = hashpass;
      next();
    }
  } catch (error) {
    console.error(error);
  }
});

// generating auth token
userSchema.methods.generateAuthToken = async function (req) {
  try {
    const tokenExpiration = process.env.TOKEN_EXPIRATION || "1h"; // Set expiration time (default: 1 hour)

    // Generate JWT token
    const createToken = jwt.sign(
      { _id: this._id },
      "IAMSUDIPTAGHORAMI32@GMAIL.COM1232145654",
      { expiresIn: tokenExpiration }
    );

    // Set token in session
    req.session.authToken = createToken;

    // Save the token to the user document
    this.tokens = this.tokens.concat({ token: createToken });
    await this.save();

    return createToken;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate auth token");
  }
};

// // we are storing message
// userSchema.methods.addMessage = async function (name, email, phone, message) {
//   try {
//     this.messages = this.messages.concat({ name, email, phone, message });
//     await this.save();
//     return this.messages;
//   } catch (error) {
//     console.error(error);
//   }
// };
const User = mongoose.model("userinfo", userSchema);

module.exports = User;

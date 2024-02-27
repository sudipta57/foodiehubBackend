const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const resturantSchema = new mongoose.Schema({
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
  address: {
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
//hashing the passwords
resturantSchema.pre("save", async function (next) {
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
resturantSchema.methods.generateAuthToken = async function () {
  try {
    const tokenExpiration = process.env.TOKEN_EXPIRATION || "1h"; // Set expiration time (default: 1 hour)

    let createToken = jwt.sign(
      { _id: this._id },
      "IAMSUDIPTAGHORAMI32@GMAIL.COM1232145654",
      { expiresIn: tokenExpiration }
    );

    // Save the token to the user document
    this.tokens = this.tokens.filter(
      (token) => jwt.decode(token.token).exp > Date.now()
    ); // Remove expired tokens
    this.tokens.push({ token: createToken });
    await this.save();

    return createToken;
  } catch (error) {
    console.error(error);
  }
};
const Resturant = mongoose.model("resturantuserinfo", resturantSchema);
module.exports = Resturant;

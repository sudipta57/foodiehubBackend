const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const authenticate = async (req, res, next) => {
  try {
    const tokenfromcookie = req.cookies?.authToken;

    if (!tokenfromcookie) {
      return res.status(422).json({ error: "token not provided" });
    }

    const verifyToken = jwt.verify(
      tokenfromcookie,
      "IAMSUDIPTAGHORAMI32@GMAIL.COM1232145654"
    );

    if (verifyToken) {
      const rootuser = await User.findOne({
        _id: verifyToken._id,
        "tokens.token": tokenfromcookie,
      });

      if (!rootuser) {
        return res.status(422).json({ error: "User not found" });
      }
      req.token = tokenfromcookie;
      req.rootuser = rootuser;
      req.userId = rootuser._id;
      next();
    } else {
      return res.status(422).json({ error: "token not provided" });
    }
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: "Unauthorized token not provided" });
  }
};

module.exports = authenticate;

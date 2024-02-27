const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const authenticate = async (req, res, next) => {
  try {
    if (req.email) {
      const user = await User.findOne({ email: req.email });
      const tokensFromCookie = user.tokens.map((tokenObj) => tokenObj.token);

      if (!tokensFromCookie || tokensFromCookie.length === 0) {
        return res.status(422).json({ error: "Tokens not provided" });
      }

      for (const token of tokensFromCookie) {
        const verifyToken = jwt.verify(
          token,
          "IAMSUDIPTAGHORAMI32@GMAIL.COM1232145654"
        );

        if (verifyToken) {
          const rootuser = await User.findOne({
            _id: verifyToken._id,
            "tokens.token": token,
          });

          if (!rootuser) {
            return res.status(422).json({ error: "User not found" });
          }

          req.token = token;
          req.rootuser = rootuser;
          req.userId = rootuser._id;
          next();
          return; // Exit the loop once a valid token is found
        }
      }

      // If no valid token is found
      return res.status(422).json({ error: "Invalid token" });
    } else {
      return res.status(422).json({ error: "Token not provided" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later" });
  }
};

module.exports = authenticate;

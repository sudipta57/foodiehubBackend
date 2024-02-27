const jwt = require("jsonwebtoken");
const Resturant = require("../models/resturentSchema");
const resturantauthenticate = async (req, res, next) => {
  try {
    if (req.resemail) {
      const tokenfromcookie = Resturant.findOne({ email: req.resemail });
      if (!tokenfromcookie) {
        return res.status(422).json({ error: "token not provided" });
      }

      for (const token of tokenfromcookie) {
        const verifyToken = jwt.verify(
          token,
          "IAMSUDIPTAGHORAMI32@GMAIL.COM1232145654"
        );

        if (verifyToken) {
          const rootresturant = await Resturant.findOne({
            _id: verifyToken._id,
            "tokens.token": tokenfromcookie,
          });

          if (!rootresturant) {
            return res.status(422).json({ error: "User not found" });
          }
          req.token = tokenfromcookie;
          req.rootresturant = rootresturant;
          req.userId = rootresturant._id;
          next();
        }
      }
    } else {
      return res.status(422).json({ error: "token not provided" });
    }
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: "Unauthorized token not provided" });
  }
};

module.exports = resturantauthenticate;

const express = require("express");
const router = express.Router();

var jwt = require("jsonwebtoken");
 
const JWT_SECRET = process.env.Super_Admin_Secret;

router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  if (
    email != process.env.Super_Admin_Mail ||
    password != process.env.Super_Admin_Pass
  ) {
    return res
      .status(400)
      .json({ sucess: false, error: "Enter the valid credentials .   " });
  }

  const data = {
    user: {
      position: "SuperAdmin",
    },
  };

  var authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "1d" });
  res.json({ sucess: true, super_admin_authtoken: authtoken });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const VerifySuperAdmin = require("./../../middleware/VerifySuperAdmin");
const Administration = require("./../../model/Administration");

const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { employeeid, password } = req.body;

  try {
    // Check if the employee ID exists
    const admin = await Administration.findOne({ employeeid });
    if (!admin) {
      return res.json({
        success: false,
        message: "Invalid employee ID or password.",
      });
    }

    // Compare passwords
    let pass_match = bcrypt.compareSync(password, admin.password);
    if (!pass_match) {
      return res.json({
        success: false,
        message: "Invalid employee ID or password.",
      });
    }

    // Create and sign a JWT token
    const data = {
        user: {
          position: "Administration",
          employeeid: admin.employeeid
        },
      };
    const token = jwt.sign(
      data,
      process.env.Super_Admin_Secret,
      { expiresIn: "1d" }
    );

    return res.json({ success: true, message: "Login successful.", administration_authtoken:token });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred during login." });
  }
});

router.post("/create", VerifySuperAdmin, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "Only Admin can create administrator",
    });
  } else {
    const { employeeid, name, email } = req.body;

    try {
      // Check if the employeeid already exists
      const existingAdmin = await Administration.findOne({ employeeid });
      if (existingAdmin) {
        return res.json({
          success: false,
          alreadyExist: true,
          message: "Employee ID already exists.",
        });
      }
      const salt = await bcrypt.genSaltSync(8);
      const secpassword = await bcrypt.hashSync(req.body.password, salt);
      // Create a new Administration record
      const newAdmin = new Administration({
        employeeid,
        name,
        email,
        password: secpassword,
      });

      // Save the new administration record
      await newAdmin.save();

      return res.json({
        success: true,
        message: "Administration created successfully.",
      });
    } catch (error) {
      console.error("Error creating administration:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while creating administration.",
        });
    }
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_Secret; // Change this to your actual secret

const WatchMan = require("./../../model/WatchMan"); // Adjust the path as needed
const VerifySuperAdmin = require("../../middleware/VerifySuperAdmin");
const VerifyAdministration = require("../../middleware/VerifyAdministration");

router.post("/login", async (req, res) => {
  const { phno } = req.body;

  if (!phno) {
    return res.status(400).json({ success: false, error: "Parent phone number is required." });
  }

  try {
    // Find the student with the provided parent phone number
    const Man = await WatchMan.findOne({
     phno
    });

    if (!Man) {
      return res.status(404).json({ success: false, error: "WatchMan not found." });
    }

    // Create a JWT token with relevant data
    const data = {
      user: {
        phno: phno,
        position: "WatchMan",
      },
    };

    const authtoken = jwt.sign(data, process.env.Super_Admin_Secret, { expiresIn: "1d" });

    res.json({ success: true, authtoken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
});


router.post("/create", VerifySuperAdmin, VerifyAdministration,async (req, res) => {

    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Only Admin, Administration can create WatchMan",
        });
      } else {
    const { phno} = req.body;
  
    try {
      // Check if the parent's phone number already exists
      const existingMan = await WatchMan.findOne({ phno });
      if (existingMan) {
        return res.json({
          success: false,
          alreadyExist: true,
          message: "phone number already exists.",
        });
      }
  
      // Create a new Parent record with kid roll numbers
      const newMan = new WatchMan({
        phno,
      });
  
      // Save the new parent record
      await newMan.save();
  
      return res.json({
        success: true,
        message: "Watch Man created successfully.",
      });
    } catch (error) {
      console.error("Error creating WatchMan:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while creating WatchMan.",
        });
    }
}
  });



module.exports = router;

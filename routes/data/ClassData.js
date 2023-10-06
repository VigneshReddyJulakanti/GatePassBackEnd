
const express = require("express");
const router = express.Router();
const Class = require("../../model/Class"); // Adjust the path to your Class model

// Route to get all class data
router.get("/", async (req, res) => {
  try {
    // Find all class data
    const classes = await Class.find({});

    res.json({ success: true, classes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

router.post("/add",async (req, res) => {
  try {
    // Extract class data from the request body
    const { department, section, year } = req.body;

    // Check if the required fields are provided
    if (!department || !section || !year) {
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    // Create a new class instance
    const newClass = new Class({
      department: department.toLowerCase(),
      section: section.toLowerCase(),
      year: year,
    });

    // Save the new class to the database
    await newClass.save();

    res.json({ success: true, message: "Class added successfully.", newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

module.exports = router;

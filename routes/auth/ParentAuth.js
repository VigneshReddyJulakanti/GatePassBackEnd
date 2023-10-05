const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_Secret; // Change this to your actual secret

const Student = require("./../../model/Student"); // Adjust the path as needed

router.post("/login", async (req, res) => {
  const { parentphno } = req.body;

  if (!parentphno) {
    return res.status(400).json({ success: false, error: "Parent phone number is required." });
  }

  try {
    // Find the student with the provided parent phone number
    const student = await Student.findOne({
      $or: [
        { "parentno.parentphno1": parentphno },
        { "parentno.parentphno2": parentphno },
      ],
    });

    if (!student) {
      return res.status(404).json({ success: false, error: "Student not found." });
    }

    // Create a JWT token with relevant data
    const data = {
      user: {
        parentphno: parentphno,
        position: "Parent",
      },
    };

    const authtoken = jwt.sign(data, process.env.Super_Admin_Secret, { expiresIn: "1d" });

    res.json({ success: true, authtoken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Teacher = require("./../../model/ClassTeacher");
const VerifyAdministration = require("../../middleware/VerifyAdministration");
const VerifySuperAdmin = require("../../middleware/VerifySuperAdmin");

router.post("/login", async (req, res) => {
  const { employeeid, password } = req.body;

  try {
    // Check if the teacher's employee ID exists
    const teacher = await Teacher.findOne({ employeeid });
    if (!teacher) {
      return res.json({
        success: false,
        message: "Invalid employee ID or password.",
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, teacher.password);
    if (!passwordMatch) {
      return res.json({
        success: false,
        message: "Invalid employee ID or password.",
      });
    }

    // Create and sign a JWT token

    const data = {
        user: {
          position: "Teacher",
          employeeid: teacher.employeeid
        },
      };
    const token = jwt.sign(
      data,
      process.env.Super_Admin_Secret,
      { expiresIn: "1d" }
    );

    return res.json({ success: true, message: "Login successful.", teacher_authtoken:token });
  } catch (error) {
    console.error("Error during teacher login:", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred during login." });
  }
});

router.post("/create", VerifySuperAdmin, VerifyAdministration ,async (req, res) => {

    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Only Admin,Administration can create Teacher",
        });
      } else {
    const { employeeid, name, email, password, classDetails } = req.body;
  
    try {
      // Check if the teacher's employeeid already exists
      const existingTeacher = await Teacher.findOne({ employeeid });
      if (existingTeacher) {
        return res.json({
          success: false,
          alreadyExist: true,
          message: "Employee ID already exists.",
        });
      }
  
      const salt = await bcrypt.genSaltSync(8);
      const hashedPassword = await bcrypt.hashSync(password, salt);
  
      // Create a new Teacher record with class details
      const newTeacher = new Teacher({
        employeeid,
        name,
        email,
        password: hashedPassword,
        class: classDetails, 
      });
  
      // Save the new teacher record
      await newTeacher.save();
  
      return res.json({
        success: true,
        message: "Teacher created successfully.",
      });
    } catch (error) {
      console.error("Error creating teacher:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while creating teacher.",
        });
    }

}
  });

module.exports = router;

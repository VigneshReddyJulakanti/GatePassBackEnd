const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("./../../model/Student"); // Adjust the path to your Student model
const VerifyAdministration = require("../../middleware/VerifyAdministration");
const VerifySuperAdmin = require("../../middleware/VerifySuperAdmin");
const VerifyTeacher=require("./../../middleware/VerifyTeacher")
var nodemailer = require('nodemailer');
router.post("/login", async (req, res) => {
  const { rollno, password } = req.body;

  try {

    // Check if the student's roll number exists
    const student = await Student.findOne({ rollno });
    if (!student) {
      return res.json({
        success: false,
        message: "Invalid roll number or password.",
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return res.json({
        success: false,
        message: "Invalid roll number or password.",
      });
    }

    // Create and sign a JWT token
    const data = {
      user: {
        position: "Student",
        rollno: student.rollno
      },
    };
    const token = jwt.sign(
      data,
      process.env.Super_Admin_Secret, // Adjust this to your actual secret
      { expiresIn: "1d" }
    );

    return res.json({ success: true, message: "Login successful.", student_authtoken: token });
  } catch (error) {
    console.error("Error during student login:", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred during login." });
  }
});

router.post("/create", VerifySuperAdmin, VerifyAdministration ,VerifyTeacher,async (req, res) => {


    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Only Admin,Administration,Teacher can create Student",
        });
      } else {
        const { rollno, name, class: { department, section, year }, email, password, parentno: { parentphno1, parentphno2 } } = req.body;
  
    try {
      // Check if a student with the same roll number already exists
      const existingStudent = await Student.findOne({ rollno });
      if (existingStudent) {
        return res.json({
          success: false,
          alreadyExist: true,
          message: "Student with this roll number already exists.",
        });
      }
  
      const salt = await bcrypt.genSaltSync(8);
      const hashedPassword = await bcrypt.hashSync(password, salt);
  
      // Create a new Student record with class details
      const newStudent = new Student({
        rollno,
        name,
        class: {
          department,
          section,
          year,
        },
        email,
        password: hashedPassword,
        parentno: {
          parentphno1,
          parentphno2,
        },
      });
  
      await newStudent.save();
  
      res.json({ success: true, message: "Student registered successfully." });

      sendMail(email,password,rollno,name)
    } catch (error) {
      console.error("Error during student registration:", error);
      res.status(500).json({ success: false, error: "Server error." });
    }

}
  });


  function sendMail(recMail,RecPassWord,rollno,name){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.node_mailer_email,
        pass: process.env.node_mailer_pass
      }
    });
    
    var mailOptions = {
      from: process.env.node_mailer_email,
      to: recMail,
      subject: 'Your Login Credentials for KMIT Gate Pass',
      text: `Hi ${name} ${rollno} Kmit Gate Pass account got created
      Password :${RecPassWord}
      `
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
  
  module.exports = router;
  
// Your other routes...



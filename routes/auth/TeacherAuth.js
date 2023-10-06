const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Teacher = require("./../../model/ClassTeacher");
const VerifyAdministration = require("../../middleware/VerifyAdministration");
const VerifySuperAdmin = require("../../middleware/VerifySuperAdmin");
var nodemailer = require('nodemailer');
const VerifyTeacher = require("../../middleware/VerifyTeacher");
const VerifyHOD = require("./../../middleware/VerifyHOD");


router.get("/all", VerifySuperAdmin, VerifySuperAdmin,VerifyHOD,VerifyAdministration, async (req, res) => {
  try {
    // Fetch all teachers from the database, excluding the password field
    const teachers = await Teacher.find({}, { password: 0 });

    return res.json({ success: true, teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching teachers.",
    });
  }
});




router.post("/", VerifyTeacher ,async (req, res) => {

  let employeeid=req.employeeid;
  try {
    // Check if the employee ID exists
    const user = await Teacher.findOne({ employeeid });
    delete user["password"]
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid employee ID ",
      });
    }



    return res.json({ success: true,data:user });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred during login." });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the teacher's employee ID exists
    const teacher = await Teacher.findOne({ email });
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

    return res.json({ success: true, message: "Login successful.", authtoken:token });
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
      sendMail(email,password,employeeid,name)
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

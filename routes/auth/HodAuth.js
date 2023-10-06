const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HOD = require("./../../model/Hod"); // Adjust the path as needed
const VerifyAdministration = require("../../middleware/VerifyAdministration");
const VerifySuperAdmin = require("../../middleware/VerifySuperAdmin");
var nodemailer = require('nodemailer');
const VerifyHOD = require("./../../middleware/VerifyHOD");


router.get("/all", VerifySuperAdmin,VerifyAdministration, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "Wrong access",
    });
  }else{
  try {
    // Fetch all HODs from the database
    const hods = await HOD.find({}, { password: 0 }); // Exclude the password field

    return res.json({ success: true, hods });
  } catch (error) {
    console.error("Error fetching HODs:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching HODs.",
    });
  }
}
});

router.post("/", VerifyHOD,async (req, res) => {

  let empid=req.user.empid;
  try {
    // Check if the employee ID exists
    const user = await HOD.findOne({ empid });
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
    // Check if the HOD's employee ID exists
    const hod = await HOD.findOne({ email });
    if (!hod) {
      return res.json({
        success: false,
        message: "Invalid employee ID or password.",
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, hod.password);
    if (!passwordMatch) {
      return res.json({
        success: false,
        message: "Invalid employee ID or password.",
      });
    }

    // Create and sign a JWT token
    const data = {
      user: {
        position: "HOD",
        empid: hod.empid,
        department:hod.department
      },
    };
    const token = jwt.sign(
      data,
      process.env.Super_Admin_Secret,
      { expiresIn: "1d" }
    );

    return res.json({ success: true, message: "Login successful.", authtoken: token });
  } catch (error) {
    console.error("Error during HOD login:", error);
    return res
      .status(500)
      .json({ success: false, message: "An error occurred during login." });
  }
});

router.post("/create", VerifySuperAdmin, VerifyAdministration, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "Only Admin and Administration can create HOD.",
    });
  } else {
    const { empid, name, email, password, department } = req.body;

    try {
      // Check if the HOD's empid already exists
      const existingHOD = await HOD.findOne({ empid });
      if (existingHOD) {
        return res.json({
          success: false,
          alreadyExist: true,
          message: "Employee ID already exists.",
        });
      }

      const salt = await bcrypt.genSaltSync(8);
      const hashedPassword = await bcrypt.hashSync(password, salt);

      // Create a new HOD record with department
      const newHOD = new HOD({
        empid,
        name,
        email,
        password: hashedPassword,
        department,
      });

      // Save the new HOD record
      await newHOD.save();
      sendMail(email,password,empid,name)
      return res.json({
        success: true,
        message: "HOD created successfully.",
      });
    } catch (error) {
      console.error("Error creating HOD:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while creating HOD.",
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

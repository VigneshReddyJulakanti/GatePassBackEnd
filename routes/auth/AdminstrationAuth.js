const express = require("express");
const router = express.Router();
const VerifySuperAdmin = require("./../../middleware/VerifySuperAdmin");
const Administration = require("./../../model/Administration");

const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');
const VerifyAdministration = require("../../middleware/VerifyAdministration");


router.get("/all", VerifySuperAdmin, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "Wrong access",
    });
  }else{
  try {
   
    // Fetch all administrators from the database
    const administrators = await Administration.find({}, { password: 0 }); // Exclude the password field

    return res.json({ success: true, administrators });
  } catch (error) {
    console.error("Error fetching administrators:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching administrators.",
    });
  }
}
});

router.post("/", VerifyAdministration,async (req, res) => {

  let employeeid=req.user.employeeid;
  try {
    // Check if the employee ID exists
    const user = await Administration.findOne({ employeeid });
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
    // Check if the employee ID exists
    const admin = await Administration.findOne({ email });
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

    return res.json({ success: true, message: "Login successful.", authtoken:token });
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
    const { employeeid, name, email,password } = req.body;

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

      sendMail(email,password,employeeid,name)
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

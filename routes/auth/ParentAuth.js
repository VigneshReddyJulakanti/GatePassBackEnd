const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Parent = require("./../../model/Parent");
const VerifyAdministration = require("../../middleware/VerifyAdministration");
const VerifySuperAdmin = require("../../middleware/VerifySuperAdmin");
const VerifyTeacher=require("../../middleware/VerifyTeacher");










const admin = require('firebase-admin');
const serviceAccount = require('./../../gatepass-bc959-firebase-adminsdk-bgo0a-7beebb8677.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // ...
});




// const firebase = require('./../../firebaseService').default; // Import the Firebase service



router.post('/send-otp', async (req, res) => {
  
  // const { phoneNumber } = req.body;

  const phoneNumber = '+918309882962'; // User's phone number including country code
const options = {
  phoneNumber
  // recaptchaToken: 'recaptcha-token', // Optional: Recaptcha token for spam prevention
};

try {
  const verification = await admin.auth().createPhoneVerification(options);
  console.log('OTP sent:', verification);
} catch (error) {
  console.error('Error sending OTP:', error);
}
res.json({"done":true})
});


// router.post('/send-otp', async (req, res) => {
//   const { phoneNumber } = req.body;

//   try {
//     // Send OTP to the provided phone number
//     const confirmationResult = await firebase.signInWithPhoneNumber(firebase.getAuth(),phoneNumber);
    
//     // The confirmationResult can be used later to verify the OTP
//     // Store the verification ID for later use
//     const verificationId = confirmationResult.verificationId;

//     return res.json({ success: true, message: 'OTP sent successfully.', verificationId });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     return res.status(500).json({ success: false, message: 'An error occurred while sending OTP.' });
//   }
// });

// router.post('/send-otp', async (req, res) => {
//   const { phoneNumber } = req.body;

//   try {
//     const verification = await firebase.auth().createUser({
//       phoneNumber,
//     });

//     return res.json({ success: true, message: 'OTP sent successfully.', uid: verification.uid });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     return res.status(500).json({ success: false, message: 'An error occurred while sending OTP.' });
//   }
// });

























// router.post("/login", async (req, res) => {
//   const { parentphno } = req.body;

//   try {
//     // Check if the parent's phone number exists
//     const parent = await Parent.findOne({ parentphno });
//     if (!parent) {
//       return res.json({
//         success: false,
//         message: "Invalid parent phone number.",
//       });
//     }

//     // Create and sign a JWT token
//     const data = {
//       user: {
//         position: "Parent",
//         parentphno: parent.parentphno,
//       },
//     };
//     const token = jwt.sign(
//       data,
//       process.env.Super_Admin_Secret,
//       { expiresIn: "1d" }
//     );

//     return res.json({ success: true, message: "Login successful.", parent_authtoken: token });
//   } catch (error) {
//     console.error("Error during parent login:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "An error occurred during login." });
//   }
// });

router.post("/create", VerifySuperAdmin, VerifyAdministration, VerifyTeacher,async (req, res) => {

    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Only Admin, Administration,Teacher can create Parent",
        });
      } else {
    const { parentphno, kidrollno } = req.body;
  
    try {
      // Check if the parent's phone number already exists
      const existingParent = await Parent.findOne({ parentphno });
      if (existingParent) {
        return res.json({
          success: false,
          alreadyExist: true,
          message: "Parent phone number already exists.",
        });
      }
  
      // Create a new Parent record with kid roll numbers
      const newParent = new Parent({
        parentphno,
        kidrollno,
      });
  
      // Save the new parent record
      await newParent.save();
  
      return res.json({
        success: true,
        message: "Parent created successfully.",
      });
    } catch (error) {
      console.error("Error creating parent:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while creating parent.",
        });
    }
}
  });

module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Student = require("../../model/Student");
const VerifyHOD = require("./../../middleware/VerifyHOD"); // Adjust the path to your VerifyHOD middleware
const GatePassForm = require("../../model/GatePassForm"); // Adjust the path to your GatePassForm model
const Hod = require("../../model/Hod");

// Route to get data of forms in the HOD's department
router.get("/", VerifyHOD, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "HOD can view forms for their department only.",
    });
  } else {
    const department = req.user.department;

    try {
      // Find all students in the HOD's department
      const students = await Student.find({ "class.department": department });

      // Extract student roll numbers
      const studentRolls = students.map((student) => student.rollno);

      // Find gate pass forms associated with student roll numbers

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
  
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const forms = await GatePassForm.find({
        sent_out:false, rollno: { $in: studentRolls }, parent_accepted:true,dateTime: { $gte: todayStart, $lte: todayEnd }
      });

      res.json({ success: true, forms });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error." });
    }
  }
});
router.get("/all", VerifyHOD, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "HOD can view forms for their department only.",
    });
  } else {
    const department = req.user.department;

    try {
      // Find all students in the HOD's department
      const students = await Student.find({ "class.department": department });

      // Extract student roll numbers
      const studentRolls = students.map((student) => student.rollno);

      // Find gate pass forms associated with student roll numbers
      const forms = await GatePassForm.find({
        rollno: { $in: studentRolls }, parent_accepted:true
      });

      res.json({ success: true, forms });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error." });
    }
  }
});

// Route to accept a form
router.post("/accept", VerifyHOD, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "HOD can accept forms for their department only.",
    });
  } else {
    const { _id } = req.body;



    try {
      // Find the gate pass form
      const form = await GatePassForm.findOne({
        _id,"class.department":req.user.department
      });

      if (!form) {
        return res.status(404).json({ success: false, error: "Form not found." });
      }

      const hod=await Hod.findOne({empid:req.user.empid})
      if (!hod) {
        return res.status(404).json({ success: false, error: "hod not found." });
      }
      // Update the form's hod_accepted and save the form
      form.teacher_accepted = true;
      form.teacher_rejected = false;
      form.teacher_message = "";
      form.teacher_name=hod.name;
      await form.save();

      res.json({ success: true, message: "Form accepted successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error." });
    }
  }
});

// Route to decline a form
router.post("/decline", VerifyHOD, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "HOD can decline forms for their department only.",
    });
  } else {
    const department = req.department;
    const { _id, hod_message } = req.body;

    try {
      // Find the gate pass form
      const form = await GatePassForm.findOne({
        _id,
        "student.class.department": department,
      });

      if (!form) {
        return res.status(404).json({ success: false, error: "Form not found." });
      }
      const hod=await Hod.findOne({empid:req.user.empid})
      if (!hod) {
        return res.status(404).json({ success: false, error: "hod not found." });
      }
      // Update the form's hod_accepted and save the form
      form.teacher_accepted = false;
      form.teacher_rejected = true;
      form.teacher_message = hod_message;
      form.teacher_name=hod.name;
      await form.save();

      res.json({ success: true, message: "Form declined successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Server error." });
    }
  }
});

module.exports = router;

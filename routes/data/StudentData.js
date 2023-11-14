const express = require("express");
const router = express.Router();
const VerifyStudent = require("../../middleware/VerifyStudent"); // Adjust the path to your VerifyStudent middleware
const GatePassForm = require("../../model/GatePassForm"); // Adjust the path to your GatePassForm model
const Student = require("../../model/Student"); // Adjust the path to your Student model

router.post("/createForm", VerifyStudent, async (req, res) => {

    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Student can Create Form",
        });
      } else {
  const { reason } = req.body;
  const rollno = req.rollno;

  try {
    // Fetch student details
    const student = await Student.findOne({ rollno });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    console.log(student)

    // Populate form data
    const newForm = new GatePassForm({
      rollno,
      name: student.name,
      class: student.class,
      reason,
      dateTime: new Date(), // Set to present dateTime
      teacher_accepted: false,
      teacher_rejected: false,
      parent_accepted: false,
      parent_rejected: false,
      admin_accepted: false,
      admin_rejected: false,
      teacher_message: "",
      parent_message: "",
      admin_message: "",
    });

    await newForm.save();

    res.json({ success: true, message: "Form created successfully." });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});


router.get("/", VerifyStudent, async (req, res) => {

  if (req.valid == false) {
    return res.json({
      success: false,
      message: "Student can View Forms",
    });
  } else {
    const rollno = req.rollno;

    try {
      const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
      // Fetch all forms submitted by the student
      const forms = await GatePassForm.find({sent_out:false, rollno ,dateTime: { $gte: todayStart, $lte: todayEnd }});

      res.json({ success: true, forms });
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ success: false, error: "Server error." });
    }
  }
});


router.get("/all", VerifyStudent, async (req, res) => {

  if (req.valid == false) {
    return res.json({
      success: false,
      message: "Student can View Forms",
    });
  } else {
    const rollno = req.rollno;

    try {
    //   const todayStart = new Date();
    // todayStart.setHours(0, 0, 0, 0);

    // const todayEnd = new Date();
    // todayEnd.setHours(23, 59, 59, 999);
      // Fetch all forms submitted by the student
      const forms = await GatePassForm.find({ rollno });

      res.json({ success: true, forms });
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ success: false, error: "Server error." });
    }
  }
});

module.exports = router;

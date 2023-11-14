const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const VerifyWatchMan = require("../../middleware/VerifyWatchman");
const GatePassForm = require("../../model/GatePassForm");

router.get("/", VerifyWatchMan, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "WatchMan Can Access Forms",
        });
      } else {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const forms = await GatePassForm.find({sent_out:false,dateTime: { $gte: todayStart, $lte: todayEnd } ,  teacher_accepted: true ,parent_accepted:true,admin_accepted:true});
    console.log(forms)
    res.json({ success: true, forms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});


router.post("/sent", VerifyWatchMan, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Watch Man Can Access Forms",
        });
      } else {
  try {
    const form = await GatePassForm.findOne({_id:req.body._id,  teacher_accepted: true ,parent_accepted:true,admin_accepted:true});

    console.log(form)
    if (!form) {
        console.log("form not found")
      return res.status(404).json({ success: false, error: "Form not found." });
    }

    // Update the form's admin_accepted and save the form
    form.sent_out = true;
    await form.save();

    res.json({ success: true, message: "sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

module.exports = router;

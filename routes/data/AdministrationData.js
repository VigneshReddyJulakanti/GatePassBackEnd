const express = require("express");
const router = express.Router();
const VerifyAdministration = require("../../middleware/VerifyAdministration"); // Adjust the path to your VerifyAdministration middleware
const GatePassForm = require("../../model/GatePassForm"); // Adjust the path to your GatePassForm model
const Administration=require("../../model/Administration")






// Route to accept a form (Administration)
router.post("/accept", VerifyAdministration, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Admin Can Access Forms",
        });
      } else {
  try {
    const form = await GatePassForm.findById({_id:req.body._id,  teacher_accepted: true ,parent_accepted:true });
    if (!form) {
      return res.status(404).json({ success: false, error: "Form not found." });
    }

    const admin=await Administration.findOne({employeeid:req.user.employeeid});
    if (!admin) {
      return res.status(404).json({ success: false, error: "Form not found." });
    }
    // Update the form's admin_accepted and save the form
    form.admin_accepted = true;
    form.admin_rejected = false;
    form.admin_message = "";
    form.administration_name=admin.name;
    await form.save();

    res.json({ success: true, message: "Form accepted by administration." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

// Route to decline a form (Administration)
router.post("/decline", VerifyAdministration, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Admin Can Access Forms",
        });
      } else {
  const { admin_message } = req.body;

  try {
    const form = await GatePassForm.findById({_id:req.body._id, parent_accepted: true,teacher_accepted:true });
    if (!form) {
      return res.status(404).json({ success: false, error: "Form not found." });
    }
    const admin=await Administration.findOne({employeeid:req.user.employeeid});
    if (!admin) {
      return res.status(404).json({ success: false, error: "admin not found." });
    }

    // Update the form's admin_accepted and save the form
    form.admin_accepted = false;
    form.admin_rejected = true;
    form.admin_message = admin_message;
    form.administration_name=admin.name;

    await form.save();

    res.json({ success: true, message: "Form declined by administration." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

// Route to get all forms (Administration)
router.get("/", VerifyAdministration, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Admin Can Access Forms",
        });
      } else {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const forms = await GatePassForm.find({sent_out:false,dateTime: { $gte: todayStart, $lte: todayEnd },parent_accepted:true,teacher_accepted:true});
    res.json({ success: true, forms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

router.get("/all", VerifyAdministration, async (req, res) => {
  if (req.valid == false) {
      return res.json({
        success: false,
        message: "Admin Can Access Forms",
      });
    } else {
try {
  // const todayStart = new Date();
  // todayStart.setHours(0, 0, 0, 0);

  // const todayEnd = new Date();
  // todayEnd.setHours(23, 59, 59, 999);
  const forms = await GatePassForm.find();
  res.json({ success: true, forms });
} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, error: "Server error." });
}
}
});


module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Student=require("./../../model/Student")
const VerifyParent = require("./../../middleware/VerifyParent"); // Adjust the path to your VerifyParent middleware
const GatePassForm = require("./../../model/GatePassForm"); // Adjust the path to your GatePassForm model

// Route to get data of kidrollno forms
router.get("/", VerifyParent, async (req, res) => {

    if (req.valid == false) {
        return res.json({
          success: false,
          message: "parent can View Forms",
        });
      } else {
  const parentphno = req.parentphno;

  try {
    // Find the parent's record using the parent phone number
    const students = await Student.find({$or:[ {"parentno.parentphno1":parentphno},{"parentno.parentphno2":parentphno} ]});
    // console.log(students)

    let studentRolls=[]
    for(let i of students){
        studentRolls.push(i.rollno);
    }
    // console.log(studentRolls)
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    // Find forms associated with kidrollno of the parent
    const forms = await GatePassForm.find({ sent_out:false,rollno: { $in: studentRolls},dateTime: { $gte: todayStart, $lte: todayEnd } });

    res.json({ success: true, forms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

router.get("/all", VerifyParent, async (req, res) => {

  if (req.valid == false) {
      return res.json({
        success: false,
        message: "parent can View Forms",
      });
    } else {
const parentphno = req.parentphno;

try {
  // Find the parent's record using the parent phone number
  const students = await Student.find({$or:[ {"parentno.parentphno1":parentphno},{"parentno.parentphno2":parentphno} ]});
  // console.log(students)

  let studentRolls=[]
  for(let i of students){
      studentRolls.push(i.rollno);
  }
  // console.log(studentRolls)
  

  // Find forms associated with kidrollno of the parent
  const forms = await GatePassForm.find({ rollno: { $in: studentRolls} });

  res.json({ success: true, forms });
} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, error: "Server error." });
}
}
});

// Route to accept a form
router.post("/accept", VerifyParent, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Parent Can Access Forms",
        });
      } else {
          //   const = req._id;
          
          try {

      const { _id  } = req.body;
      const parentphno = req.parentphno;
      const students = await Student.find({$or:[ {"parentno.parentphno1":parentphno},{"parentno.parentphno2":parentphno} ]});


      // Find the form using the provided formId
    const form = await GatePassForm.findById({_id});
    if (!form) {
      return res.status(404).json({ success: false, error: "Form not found." });
    }
    let CorrectUser=false;
    for(let i of students){
        if(i.rollno==form.rollno){
            CorrectUser=true;
        }
    }
    if(CorrectUser==false){
        return res.status(404).json({ success: false, error: "Invalid Acess" });

    }

    // Update the form's parent_accepted and save the form
    form.parent_accepted = true;
    form.parent_rejected=false;
    form.parent_message="";
    await form.save();

    res.json({ success: true, message: "Form accepted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

// // Route to decline a form
router.post("/decline", VerifyParent, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "You should be Parent",
        });
      } else {
          
          try {
              const {parent_message } = req.body;
              const { _id  } = req.body;
      const parentphno = req.parentphno;
      const students = await Student.find({$or:[ {"parentno.parentphno1":parentphno},{"parentno.parentphno2":parentphno} ]});


      // Find the form using the provided formId
      const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const form = await GatePassForm.findById({_id,dateTime: { $gte: todayStart, $lte: todayEnd }});
    if (!form) {
      return res.status(404).json({ success: false, error: "Form not found." });
    }
    let CorrectUser=false;
    for(let i of students){
        if(i.rollno==form.rollno){
            CorrectUser=true;
        }
    }
    if(CorrectUser==false){
        return res.status(404).json({ success: false, error: "Invalid Acess" });

    }
              // Find the form using the provided formId
 

    // Update the form's parent_rejected, parent_message and save the form
    form.parent_rejected = true;
    form.parent_accepted =false;
    form.parent_message = parent_message;
    await form.save();

    res.json({ success: true, message: "Form declined successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Student=require("../../model/Student")
const VerifyParent = require("../../middleware/VerifyParent"); // Adjust the path to your VerifyParent middleware
const GatePassForm = require("../../model/GatePassForm"); // Adjust the path to your GatePassForm model
const VerifyTeacher = require("../../middleware/VerifyTeacher");
const ClassTeacher = require("../../model/ClassTeacher");

// Route to get data of kidrollno forms
router.get("/", VerifyTeacher, async (req, res) => {

    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Teacher can View Forms",
        });
      } else {
  const employeeid = req.employeeid;

  try {
    const Teacher=await ClassTeacher.findOne({employeeid},{_id:0,"class.department":1,"class.year":1,"class.section":1});

    
    console.log("Teacher",Teacher.class)
    let students=[]
    // console.log("Teacher",Teacher[0])
    for(let singleClass of Teacher.class){

    
    const temp = await Student.find({"class.department":singleClass.department,"class.year":singleClass.year,"class.section":singleClass.section});
    console.log(temp,"temp")
    
    students=[...students,...temp];

    }

    console.log(students,"students")

    let studentRolls=[]
    for(let i of students){
        studentRolls.push(i.rollno);
    }
    console.log(studentRolls)
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    // Find forms associated with kidrollno of the parent
    const forms = await GatePassForm.find({ rollno: { $in: studentRolls} ,parent_accepted:true,dateTime: { $gte: todayStart, $lte: todayEnd }});

    res.json({ success: true, forms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});


router.get("/all", VerifyTeacher, async (req, res) => {

  if (req.valid == false) {
      return res.json({
        success: false,
        message: "Teacher can View Forms",
      });
    } else {
const employeeid = req.employeeid;

try {
  const Teacher=await ClassTeacher.findOne({employeeid},{_id:0,"class.department":1,"class.year":1,"class.section":1});

  
  console.log("Teacher",Teacher.class)
  let students=[]
  // console.log("Teacher",Teacher[0])
  for(let singleClass of Teacher.class){

  
  const temp = await Student.find({"class.department":singleClass.department,"class.year":singleClass.year,"class.section":singleClass.section});
  console.log(temp,"temp")
  
  students=[...students,...temp];

  }

  console.log(students,"students")

  let studentRolls=[]
  for(let i of students){
      studentRolls.push(i.rollno);
  }
  console.log(studentRolls)
  
  // const todayStart = new Date();
  // todayStart.setHours(0, 0, 0, 0);

  // const todayEnd = new Date();
  // todayEnd.setHours(23, 59, 59, 999);
  // Find forms associated with kidrollno of the parent
  const forms = await GatePassForm.find({ rollno: { $in: studentRolls} ,parent_accepted:true});

  res.json({ success: true, forms });
} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, error: "Server error." });
}
}
});

// Route to accept a form
router.post("/accept", VerifyTeacher, async (req, res) => {
    if (req.valid == false) {
        return res.json({
          success: false,
          message: "Teacher Can Access Forms",
        });
      } else {
        const employeeid = req.employeeid;
          //   const = req._id;
          
          try {
            const Teacher=await ClassTeacher.findOne({employeeid},{_id:0,"name":1,"class.department":1,"class.year":1,"class.section":1});

    
            console.log("Teacher",Teacher.class)
            let students=[]
            // console.log("Teacher",Teacher[0])
            for(let singleClass of Teacher.class){
        
            
            const temp = await Student.find({"class.department":singleClass.department,"class.year":singleClass.year,"class.section":singleClass.section});
            console.log(temp,"temp")
            
            students=[...students,...temp];
        
            }
        
            console.log(students,"students")
        
            let studentRolls=[]
            for(let i of students){
                studentRolls.push(i.rollno);
            }
            console.log(studentRolls)
    const form = await GatePassForm.findById({_id:req.body._id,parent_accepted:true});
    if (!form) {
      return res.status(404).json({ success: false, error: "Form not found." });
    }
    let CorrectUser=false;
    for(let i of studentRolls){
        if(i==form.rollno){
            CorrectUser=true;
        }
    }
    if(CorrectUser==false){
        return res.status(404).json({ success: false, error: "Invalid Access" });

    }

    // Update the form's parent_accepted and save the form
    form.teacher_accepted = true;
    form.teacher_rejected=false;
    form.teacher_message="";
    form.teacher_name=Teacher.name;
    await form.save();

    res.json({ success: true, message: "Form accepted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

// // Route to decline a form
router.post("/decline", VerifyTeacher, async (req, res) => {
  if (req.valid == false) {
    return res.json({
      success: false,
      message: "Teacher Can Access Forms",
    });
  } else {
    const employeeid = req.employeeid;
    const {teacher_message } = req.body;
      //   const = req._id;
      
      try {
        const Teacher=await ClassTeacher.findOne({employeeid},{_id:0,"class.department":1,"class.year":1,"class.section":1});


        console.log("Teacher",Teacher.class)
        let students=[]
        // console.log("Teacher",Teacher[0])
        for(let singleClass of Teacher.class){
    
        
        const temp = await Student.find({"class.department":singleClass.department,"class.year":singleClass.year,"class.section":singleClass.section});
        console.log(temp,"temp")
        
        students=[...students,...temp];
    
        }
    
        console.log(students,"students")
    
        let studentRolls=[]
        for(let i of students){
            studentRolls.push(i.rollno);
        }
        console.log(studentRolls)
const form = await GatePassForm.findById({_id:req.body._id,parent_accepted:true});
if (!form) {
  return res.status(404).json({ success: false, error: "Form not found." });
}
let CorrectUser=false;
for(let i of studentRolls){
    if(i==form.rollno){
        CorrectUser=true;
    }
}
if(CorrectUser==false){
    return res.status(404).json({ success: false, error: "Invalid Access" });

}

// Update the form's parent_accepted and save the form
form.teacher_accepted = false;
form.teacher_rejected=true;
form.teacher_message=teacher_message;
form.teacher_name=Teacher.name;
await form.save();

res.json({ success: true, message: "Form Declined successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error." });
  }
}
});

module.exports = router;

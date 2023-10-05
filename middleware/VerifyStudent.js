const jwt = require("jsonwebtoken");

const VerifyStudent = (req, res, next) => {
  try {
    const token = req.header("authtoken");
    if (!token) {
      return res.status(401).json({ error: "Please authenticate using a valid token." });
    }

    const decoded = jwt.verify(token, process.env.Super_Admin_Secret);
   
    if (decoded.user.position != "Student") {
        req.valid = false;
      } else {
        req.valid = true;
      }
    req.rollno = decoded.user.rollno; 
    next();
  } catch (error) {
    return res.status(401).json({ error, message: "Please authenticate using a valid token." });
  }
};

module.exports = VerifyStudent;

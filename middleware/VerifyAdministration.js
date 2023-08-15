var jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.Super_Admin_Secret ||"AdminSecret";

const VerifyAdministration=(req,res,next)=>{
    if (req.valid!=undefined && req.valid==true){
        next()
    }else{

    
    try{
    const token=req.header("authtoken"); 
    // console.log(token)
    if(!token){
        res.status(401).send({error:"Please authenticate using a valid token."});
    }

    var decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded)
    if(decoded.user.position!="Administration"){
       req.valid=false;
    }
    else{
    req.valid=true;
    }
    next();

    
}catch(error){
    
    res.status(401).send({error,message:"Please authenticate using a valid token."});

}
    }

}

module.exports =VerifyAdministration
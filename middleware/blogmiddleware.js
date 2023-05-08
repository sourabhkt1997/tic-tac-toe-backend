
let jwt=require("jsonwebtoken")
// let bcrypt=require("bcrypt")

let blogauth=async(req,res,next)=>{

    try{
        let {accesstoken}=req.cookies
        console.log(accesstoken)
        let decoded=jwt.verify(accesstoken,process.env.access)
        if(decoded){
          
          next()
        }
        else{
           res.send("login again")
        }
        
    }
    catch(err){
        res.send(err)
    }
}

module.exports={blogauth}
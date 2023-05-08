let express=require("express")
const { UserModel } = require("../model/usermodel")
let userrouter=express.Router()

let bcrypt=require("bcrypt")
let jwt=require("jsonwebtoken")
let {auth}=require("../middleware/authmiddleware")
let {BlacklistModel}=require("../model/blacklistmodel")

userrouter.get("/",async(req,res)=>{
    try{
        res.send("hello")
    }
    catch(err){
        console.log(err)
        res.send(err.message)
        
    }
})

userrouter.post("/register",async(req,res)=>{

    try{
       let {email,password}=req.body
       console.log(email)
       let isuserpresent=await UserModel.findOne({email:email})
       if(isuserpresent){
        res.status(400).send({"msg":"user already registerd,please login"})
       }
       else{
        bcrypt.hash(password,5,async(err, hash)=>{
            let data=new UserModel({...req.body,password:hash})
            await data.save()
            res.status(200).send({"msg":"new user addded"})
        });
       }
    }
    catch(err){
        res.send(err.message)
    }
})

userrouter.post("/login",async(req,res)=>{

    try{
        let {email,password}=req.body
        console.log(email,password)
        let user =await UserModel.findOne({email:email})
        console.log(user)
        if(user){
            console.log(user)
        bcrypt.compare(password,user.password, async(err, result)=>{
            if(result){
               let accesstoken=jwt.sign({"userid":user._id},process.env.access,{expiresIn:"1hr"})
            
               let refreshtoken=jwt.sign({"userid":user._id},process.env.refresh,{expiresIn:"30days"})

               res.cookie("accesstoken",accesstoken)
               res.cookie("refreshtoken",refreshtoken)
               res.status(400).send ({"message":"login success full"})
            }
            else{
                res.status(400).send({"message":"incorect password"})
            }
        });
       }
       else{
        res.status(400).send({"message":"register first"})

       }
       
    }
    catch(err){

    }
})

userrouter.get("/logout",async(req,res)=>{
   
    try{

        let {accesstoken,refreshtoken}=req.cookies

        let blacklistacc=new BlacklistModel({token:accesstoken})
        let  blacklistref=new BlacklistModel({token:refreshtoken})
        await blacklistacc.save()
        await blacklistref.save()

        res.send({"msg":"blacklisted"})
    }
    catch(err){
        res.send(err)
    }

})

userrouter.get("/newtoken",auth,async(req,res)=>{
   
    try{
     let{refreshtoken}=req.cookies
     let isblacklited=await BlacklistModel.findOne({token:refreshtoken})
     if(isblacklited){
        res.send("login again")
     }
     else{
      let isvalid=jwt.verify(refreshtoken,process.env.refresh)
      if(isvalid){
       let newaccesstoken=jwt.sign({"userid":isvalid.userid},process.env.access,{expiresIn:"1hr"})
       
       res.cookie("accesstoken",newaccesstoken,{expiresIn:"1hr"})
       res.send("token genarated")
      }
      else{
        res.send("login again")
      }
    }
    }
    catch(err){
        res.send(err.message)
    }
})


module.exports={userrouter}
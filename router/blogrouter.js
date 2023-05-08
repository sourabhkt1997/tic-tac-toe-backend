let express=require("express")

let blogrouter=express.Router()
let {blogauth}=require("../middleware/blogmiddleware")
let {auth}=require("../middleware/authmiddleware")

blogrouter.get("/",auth,blogauth,async(req,res)=>{

    res.send("welcome")
})




module.exports={blogrouter}
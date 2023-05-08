let mongoose=require("mongoose")

let userSchema=mongoose.Schema({

    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
},{
    versionKey:false
})

UserModel=mongoose.model("gameuser",userSchema)

module.exports={UserModel}
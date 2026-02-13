const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")

const userSchema=new mongoose.Schema({
  email:{
    type:String,
    required:[true,"Email is required for creating a User"],
    trim:true,
    lowercase:true,
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please fill a valid email address' // Custom error message if the regex fails
    ],   //this is email regex
    unique:[true,"Email already exsists, please use another email"]

  },
  name:{
    type:String,
    required:[true,"Name is required for creating a User"],
    trim:true,
  },
  password:{
    type:String,
    required:[true,"Password is required for creating a User"],
    minlength:[6,"Password must be at least 6 characters long"],
    select:false, //this will prevent the password from being returned in any query by default
  }
},{
  timestamps:true
})


//this means before saving the user to the database, this function will be called. we can use this to hash the password before saving it to the database. we will use bcryptjs for hashing the password.
userSchema.pre("save", async function(next){
  //check if the password is modified, if not then we don't need to hash it again
  if(!this.isModified("password")){
    return 
  }
  //hash the password
  const hash=await bcrypt.hash(this.password,10);
  this.password=hash;
  return 
})



//method to compare the password entered by the user with the hashed password stored in the database. this will be used during login to authenticate the user.
userSchema.methods.comparedPassword=async function(password){
  return await bcrypt.compare(password,this.password);
}

const userModel=mongoose.model("user",userSchema);
module.exports=userModel;
const express=require('express');
const User=require('../models/User');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET='Shiveshisagood$oy';
const fetchuser = require('../middleware/fetchuser');

//Route1: create a user using POST "/api/auth/createuser",NoLogin required
router.post('/createuser',[
    body('name').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atlest 5 characters').isLength({ min: 5 }),
    body('phone').isLength({ min: 10 })
    ],async(req,res)=>{
      let success=false;
    //if there are errors,return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check whether the user with this email exists already
    try{
    let user=await User.findOne({email:req.body.email});
    console.log(user);
    if(user){
        return res.status(400).json({success, error:'Sorry a user with this email already exists'})
    }
    const salt=await bcrypt.genSalt(10);
    const secPass=await bcrypt.hash(req.body.password,salt);
    user=await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
      phone: req.body.phone
    })
    const data={
      user:{
        id:user.id
      }
    }
    const authtoken=jwt.sign(data,JWT_SECRET);
    success=true;
    res.json({success,authtoken});
  }catch(error){
    console.error(error.message);
    res.status(500).send('internal server error');
  }
})

//Route2: Authenticate a user using POST "/api/auth/login",NoLogin required
router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','Password ').exists(),
  ],async(req,res)=>{
    let success=false;
  //if there are errors,return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,password}=req.body;
  try{
    let user=await User.findOne({email});
    if(!user){
      success=false;
      return res.status(400).json({error:"Please try to login with correct credentials"});
    }
    const passwordCompare=await bcrypt.compare(password,user.password);
    if(!passwordCompare){
      success=false;
      return res.status(400).json({success,error:"Please try to login with correct credentials"});
    }
    const data={
      user:{
        id:user.id
      }
    }
    const authtoken=jwt.sign(data,JWT_SECRET);
    success=true;
    res.json({success,authtoken});
  }catch(error){
    console.error(error.message);
    res.status(500).send('Internal server error occurred!');
  }
  })

//Route3:Get loggedin user Details using: POST "/api/auth/getuser",Login required
router.post('/getuser', fetchuser, async(req,res)=>{
try{
  const userId=req.user.id;
  const user=await User.findById(userId).select('-password');
  res.send(user)
}catch(error){
  console.error(error.message);
  res.status(500).send('Internal server error occurred!');
}
})
module.exports=router;

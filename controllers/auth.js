const crypto = require('crypto')
const User = require('../models/User')
const asyncHandler =  require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
// register user
// route  POST /api/v1/auth/register
exports.register = asyncHandler(async(req,res,next) =>{
    const {name,email,password,role} = req.body;

    //Create a user 
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    sendTokenResponse(user,200,res)
})
// register user
// route  POST /api/v1/auth/login

exports.login = asyncHandler(async(req,res,next) =>{
    const {email,password} = req.body;
    //Validate email and password 
    if (!email || !password){
        return next(new ErrorResponse('Please provide an email and password',400));
    }

    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid Credentials',401));
    }

    //Check if the password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch){
        return next(new ErrorResponse('Invalid Credentials',401));  
    }

    sendTokenResponse(user,200,res)

})



// logout user
// route  GET /api/v1/auth/me
exports.logout = asyncHandler(async (req,res,next) => {

    
    res.cookie('token','none',{
        expires: new Date(Date.now() + 10*1000)
    })
    res.status(200).json({
        success:true,
        data:{}
    })
})

 

// Get current logged in user
// route  POST /api/v1/auth/me
exports.getMe = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    })
})




// Forgot password
// route  POST /api/v1/auth/forgotpassword
exports.forgotPassword = asyncHandler(async (req,res,next) => {
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorResponse('there is no user with that email',404))
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false})

    //create Reset url
    const resentUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone ele)
    requested tp reset this password . Please make a put request to : \n\n ${resentUrl}`;

    try {
        await sendEmail({
            email:user.email,
            subject:'Password reset token',
            message 
        })
        res.status(200).json({success:true,data:'Email sent'})
    } catch (error) {
        console.log(error)
        user.resetPassordToken = undefined;
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave:false})

        return next(new ErrorResponse('Email could not be send',500))

        }
    res.status(200).json({
        success:true,
        data:user
    })
})

// Reset password
// route  PUUT /api/v1/auth/resetpassword/:resettoken
exports.resetPassword = asyncHandler(async (req,res,next) => {

    const resetPasswordToken = crypto.createHash('sha256')
    .update(req.params.resettoken).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });

    if(!user){
        return next(new ErrorResponse('Invalid Token',400));
    }

    //Set  new password

    user.password= req.body.password
    user.resetPassordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user,200,res);
})


// Update user details
// route  POST /api/v1/auth/updatedetails
exports.updateDetails = asyncHandler(async (req,res,next) => {
const fieldToUpdate = {
    name:req.body.name,
    email:req.body.email
}

    const user = await User.findByIdAndUpdate(req.user.id,fieldToUpdate,{
        new:true,
        runValidators:true
    });
    
    res.status(200).json({
        success:true,
        data:user
    })
})




// Get token from model,create cookie and send response
const sendTokenResponse = (user,statusCode,res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires : new Date(Date.now() +process.env.JWT_COOKIE_EXPIRE *24*60*60*1000),
        httpOnly:true,
    }

    res
    .status(statusCode)
    .cookie('token',token,options)
    .json({
        success:true,
        token
    })
}
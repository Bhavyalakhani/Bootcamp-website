const Bootcamp = require('../models/Bootcamp')
const asyncHandler =  require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder')
const path = require('path');
// @ Get all Bootcamps
// @ route GET api/v1/bootcamps
//@access publiuc
exports.getBootcamps = asyncHandler( async (req,res,next) => {
        console.log(res.advancedResults)
        console.log('hi')
        res.status(200).json(res.advancedResults)
})
// @ Get all Bootcamps
// @ route GET api/v1/bootcamps
//@access public
exports.getBootcamp = asyncHandler(async (req,res,next) => {

     const bootcamp = await Bootcamp.findById(req.params.id)
     if(!bootcamp){
        return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
     }
     res.status(200).json({success:true,data:bootcamp})
})

// @ create Bootcamps
// @ route POST api/v1/bootcamps
//@access Private
exports.createBootcamp = asyncHandler(async (req,res,next) => {
        //Add user to request.body

        req.body.user = req.user.id;

        //Check for published bootcamp

        const publishedBootcamp = await Bootcamp.findOne({user:req.user.id});

        //If user is not an admin ,they can only add one bootcamp

        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(new ErrorResponse(`The user with id ${req.user.id} has already piblished a bootcamp`,400))
        }

        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success:true,
            data:bootcamp
        })
        
})

// @ Update Bootcamps
// @ route Update api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async (req,res,next) => {
        let bootcamp = await Bootcamp.findById(req.params.id)
        if(!bootcamp){
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        //<=MAke sure user is bootcamp owner

        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`)
            )
        }
        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })

        
        res.status(200).json({success:true,data:bootcamp})

})

// upload photo for bootcamp
// route PUT /api/v1/bootcamp/:id/photo

exports.bootcampPhotoUpload = asyncHandler(async(req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`)
        )
    }
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    
    if(!req.files){
        return next(new ErrorResponse(`please upload a photo`,400))
    }
    const file = req.files.file;
    console.log(file);

    //Make sure the image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`please upload an image file`,400))   
    }
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`please upload a photo less than ${process.env.MAX_FILE_UPLOAD}`,400))
    }

    // create custom file name 
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    console.log(process.env.FILE_UPLOAD_PATH)
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err => {
        if(err){
            console.log(err)
            return next(new ErrorResponse(`please upload a photo12312321`,500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id,{photo:file.name});
        res.status(200).json({
            success:true,
            data:file.name
        })
    })
})



// @ DELETE Bootcamps
// @ route DELETE api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)
        if(!bootcamp){
            return  next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role == 'admin'){
            return next(
                new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`)
            )
        }
bootcamp.remove();

        res.status(200).json({success:true,data:bootcamp})
})

// @GET bootcamps within the radius 
// @ route DELETE api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampsInRadius = asyncHandler(async (req,res,next) => {
    const {zipcode , distance} = req.params;

    //Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude
    // calc radius using radius
    // Divide distance by radius of earth 
    //Earth radius is 3,963 miles / 6,378kms 
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location:{
            $geoWithin : {$centerSphere : [ [lng,lat] , radius]}
        }
    })
    res.status(200).json({
        success:true,
        count:bootcamps.length,
        data:bootcamps
    })

})




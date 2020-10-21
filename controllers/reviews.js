const asyncHandler =  require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');


// @ Get reviews
// @ route GET api/v1/reviews
// @ route GET /api/v1/bootcamps/:bootcampId/courses
//@access public

exports.getReviews = asyncHandler(async(req,res,next) => {

    if(req.params.bootcampId){
        const reviews = await  Review.find({bootcamp : req.params.bootcampId})

        return res.status(200).json({
            success:true,
            count:reviews.length,
            data:reviews
        })
    }else{
        res.status(200).json(res.advancedResults)
    }
})

// @ Get single reviews
// @ route GET api/v1/reviews/:id
//@access public

exports.getReview = asyncHandler(async(req,res,next) => {

    const review = await Review.findById(req.params.id).populate({
        path:'bootcamp',
        select:'name descrition',
    });

    if(!review){
        return next(new ErrorResponse(`No review found with the id ${req.params.id}`,404))
    }

    res.status(200).json({
        success:true,
        data:review
    })
})


// @ POST reviews
// @ route GET api/v1/reviews/bootcamps/:bootcampid/reviews
//@access private 

exports.addReview = asyncHandler(async(req,res,next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    console.log(req.params.bootcampId)
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse('No bootcamp with that id',404))
    }

    const review =  await Review.create(req.body);

    res.status(200).json({
        success:true,
        data:review
    })
})

// @ PUT reviews
// @ route GET api/v1/reviews/:id
//@access private 

exports.updateReview = asyncHandler(async(req,res,next) => {
    let review = await Review.findById(req.params.id)

    if(!review){
        return next(new ErrorResponse('No bootcamp with that id',404))
    }

    if(req.user.id === review.user.toString() && req.user.role !== 'admin'){
        return next(
            new ErrorResponse('Not authorised to update the review',401)
        )
    }

     review = await Review.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        data:review
    })
})

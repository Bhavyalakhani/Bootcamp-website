const asyncHandler =  require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @ Get courses
// @ route GET api/v1/bootcamps
// @ route GET /api/v1/bootcamps/:bootcampId/courses
//@access public

exports.getCourses = asyncHandler(async(req,res,next) => {

    if(req.params.bootcampId){
        const courses = await  Course.find({bootcamp : req.params.bootcampId})

        return res.status(200).json({
            success:true,
            count:courses.length,
            data:courses
        })
    }else{
        res.status(200).json(res.advancedResults)
    }
})

// get a single course

exports.getCourse = asyncHandler(async(req,res,next) => {
    const course = await Course.findById(req.params.id).populate({
        path:'bootcamp',
        select:'name description'
    })
    if(!course){
        return next(new Error(`NO course with id ${req.params.id}`),)
    }
    res.status(200).json({
        success:true,
        data:course
    })
})

// Add course
//route POST /api/v2/bootcamps/:bootcampId/courses
// access private 

exports.addCourse = asyncHandler(async(req,res,next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!bootcamp){
        return next(new Error(`NO bootcamp with id ${req.params.bootcampId}`),)
    }
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to add a course to  this bootcamp`)
        )
    }

    const course = await Course.create(req.body)
    res.status(200).json({
        success:true,
        data:course
    })
})

// Update Course
//route   PUT /api/v1/courses/:id
// access private 

exports.updateCourse = asyncHandler(async(req,res,next) => {
    let course = await Course.findById(req.params.id);
    console.log(course)
    if(!course){
        return next(new Error(`NO course with id ${req.params.id}`),)
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to update this course`)
        )
    }

        courses = await Course.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    console.log(courses)
    res.status(200).json({
        success:true,
        data:courses
    })
})

exports.deleteCourse = asyncHandler(async(req,res,next) => {
    const course = await Course.findById(req.params.id);
    if(!course){
        return  next(new Error(`No course with the ${req.params.id}`,404))
    }

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to update this course`)
        )
    }

    await course.remove();
    res.status(200).json({
        success:true,
        data:{}
    })
})
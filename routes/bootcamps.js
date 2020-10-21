
const express = require('express');
const router = express.Router();
const { createBootcamp,getBootcamp,getBootcamps,updateBootcamp,deleteBootcamp,getBootcampsInRadius,bootcampPhotoUpload} = require("../controllers/bootcamps")

//Include other resource routers

const courseRouter = require('./courses');

const reviewRouter = require('./reviews');

const Bootcamp = require('../models/Bootcamp')

const {protect,authorize} = require('../middleware/auth')

const advancedResults = require('../middleware/advancedresult')

//Re-route into other resource routers

router.use('/:bootcampId/courses',courseRouter);

router.use('/:bootcampId/reviews',reviewRouter);

router
.route('/')
.get(advancedResults(Bootcamp,'courses'),getBootcamps)
.post(protect,authorize('publisher','admin'),createBootcamp)

router.route('/:id')
.get(getBootcamp)
.put(protect,authorize('publisher','admin'),updateBootcamp)
.delete(protect,authorize('publisher','admin'),deleteBootcamp)

router.route('/:id/photo').put(protect,bootcampPhotoUpload)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

module.exports = router;
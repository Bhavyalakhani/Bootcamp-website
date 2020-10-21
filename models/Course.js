const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const CourseSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:[true,'Please add a course title']
    },
    description:{
        type:String,
        required:[true,'Please add a description']
    },
    weeks:{
        type:String,
        required:[true,'Please add number of weeks']
    },
    tuition:{
        type:Number,
        required:[true,'Please add a tuition cost']
    },
    minimumSkill:{
        type:String,
        required:[true,'please add a minimum skill'],
        enum:['beginner','intermediate','advanced']
    },
    scholarshipAvailable:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    bootcamp:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Bootcamp',
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
});
//Static method to get avg of course tuition
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match:{bootcamp : bootcampId}
        },
        {
            $group:{
                _id:'$bootcamp',
                averageCost :{$avg :'$tuition'}
            }
        }
    ]);
    try {
        await Bootcamp.findByIdAndUpdate(bootcampId,{
            averageCost:Number(obj[0].averageCost)
        },{
            new:true,
            runValidators:true
        })
    } catch (error) {
        console.log(error)
    }

}

// Call getAverageCost after save
CourseSchema.post('save',function(){
    this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove',function(){
    this.constructor.getAverageCost(this.bootcamp);
});




module.exports = mongoose.model('Course',CourseSchema);
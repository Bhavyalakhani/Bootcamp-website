const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const ReviewSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:[true,'Please add a course title for the review'],
        maxlength:100
    },
    text:{
        type:String,
        required:[true,'Please add some text']
    },
    rating:{
        type:Number,
        min:1,
        mac:10,
        required:[true,'Please add a rating between 1 and 10']
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

ReviewSchema.index({bootcamp:1,user:1},{unique:true})


//Static method to get avg rating
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match:{bootcamp : bootcampId}
        },
        {
            $group:{
                _id:'$bootcamp',
                averageRating :{$avg :'$rating'}
            }
        }
    ]);
    try {
        await Bootcamp.findByIdAndUpdate(bootcampId,{
            averageRating:Number(obj[0].averageCost)
        },{
            new:true,
            runValidators:true
        })
    } catch (error) {
        console.log(error)
    }

}

// Call getAverageCost after save
ReviewSchema.post('save',function(){
    this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageCost before remove
ReviewSchema.pre('remove',function(){
    this.constructor.getAverageRating(this.bootcamp);
});




module.exports = mongoose.model('Review',ReviewSchema) 
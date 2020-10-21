const mongoose = require('mongoose');
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({
    name:{
      type: String,
      required :[true,'Please add name'],
      unique:true,
      trim : true,
      maxlength:[50,'Name cannot be more than 50 Characters'] 
    },
    slug :String,
    description:{
        type: String,
        required :[true,'Please add Description'],
        maxlength:[500,'Name cannot be more than 50 Characters'] 
    },
    website:{
        type:String,
    },
    phone:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        unique:true,
        match:[ /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i]
    },
    address:{
     type : String,
     required:[true,'Please add an address']   
    },
    location:{
        type:{
            type:String,
            enum :['Point'],
            required:false
        },
        coordinates:{
            type : [Number],
            required: false,
            index :'2Dsphere'
        },
        formattedAddress:String,
        City:String,
        state:String,
        zipcode:String,
        country:String        
    },
    career:{
        type:[String],
        required:true
    },
    averageRating :{
        type:Number,
        min : [1,'Rating must be at least 1'],
        max : [10,'Rating can not be more than 10']
    },
    photo:{
        type : String,
        default : 'no-photo.jpg'
    },
    housing:{
        type:Boolean,
        default:false
    },
    jobAssistance:{
        type:Boolean,
        default : false
    },
    jobGuaranteed:{
        type:Boolean,
        default : false
    },
    acceptGi:{
        type:Boolean,
        default : false
    },
    createdAt:{
        type:Date,
        default : Date.now
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
//create bootcamp slug from the name 
BootcampSchema.pre('save',function(){
    this.slug = slugify(this.name,{lower:true});
    next();
})

// Geocode & create location field
BootcampSchema.pre('save',async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type:'Point',
        coordinates: [loc[0].longitude,loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street:loc[0].streetName,
        city:loc[0].city,
        state:loc[0].stateCode,
        zipcode:loc[0].zipcode,
        country:loc[0].country

    }
//Do not save address in DB
    this.address = undefined;

    next();
})

BootcampSchema.virtual('courses',{
    ref:'Course',
    localField:'_id',
    foreignField:'bootcamp',
    justOne:false
})
// cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function(next){
    await this.model('Course').deleteMany({bootcamp:this._id})
    next();
})


module.exports = mongoose.model('Bootcamp',BootcampSchema)
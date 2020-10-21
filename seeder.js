const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv')


dotenv.config({path : './cofig/config.env'})

mongoose.connect('mongodb+srv://Bhavya:bhavya12@bhavya.m0a8y.mongodb.net/Test?retryWrites=true&w=majority',{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:true,
        useUnifiedTopology:true
    });

const Bootcamps = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User')
const Review = require('./models/Review');


const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8'));
console.log(bootcamps)

const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`,'utf-8'));

const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`,'utf-8'));
// Import into DB

const importData = async () => {
    try {
        await Bootcamps.create(bootcamps);
        await Course.create(courses);
        await User.create(users)
//        await Review.create(reviews)
        process.exit()
    } catch (error) {
        console.log(error)
    }

}



const deleteData = async () => {
    try {
        await Bootcamps.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()
//        await Review.deleteMany()
        process.exit();
    } catch (error) {
        console.error()
    }
}

if(process.argv[2] === '-i'){
    importData();
} else if(process.argv[2] === '-d'){
    deleteData();
}
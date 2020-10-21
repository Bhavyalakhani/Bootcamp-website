const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect('mongodb+srv://Bhavya:bhavya12@bhavya.m0a8y.mongodb.net/Test?retryWrites=true&w=majority',{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true
    });
    console.log('MongoDB connected:'.cyan.underline.bold+conn.connection.host.cyan.underline.bold)
}
module.exports = connectDB
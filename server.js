const express = require('express');
const app = express();
const path = require('path');
const colors = require('colors')
const helmet = require('helmet')
const xss = require('xss-clean')
const PORT = 5000
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const mongoSanitize = require('express-mongo-sanitize')

const morgan = require('morgan')
const connectDB = require('./config/db');
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv');
const cors = require('cors')
connectDB();

dotenv.config({ path: './config/config.env' });
//Body Parser
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

//set static folder

app.use(express.static(path.join('public')));

//File uploading

app.use(fileupload());

app.use(mongoSanitize());

//set security for headers
app.use(helmet);

app.use(xss());

// rate limitng
const Limiter = rateLimit({
    windowsMs:10*60*1000,
    max:1
});

app.use(Limiter);

//prevent http param pollutio

app.use(hpp());

app.use(cors());

// Route files
// mount router
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)
app.use('/api/v1/users',users)
app.use('/api/v1/reviews',reviews)
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log('App listening on port 5000!'.yellow.bold);
});

// Hnadle unhandled promise rejection
process.on('unhandledRejection', (err,promise) => {
    console.log(err.message)
    server.close(() => process.exit(1))
})
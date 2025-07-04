require('dotenv').config();

// express config
const express = require('express')
const app = express();
const fs = require('fs');
const path = require('path');


// packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet')
const { xss } = require('express-xss-sanitizer');


// database connnection
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/authRoutes');

// not-found middleware 
const notFoundMiddleware = require('./middleware/not-found')
// error handler middleware 
const errorHandlerMiddleware = require('./middleware/error-handler')
// mongoDB sanitizer middleware
const sanitizeMiddleware = require('./middleware/mongosanitize');


//packages use
app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
}))
app.use(helmet())
app.use(xss());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));

app.use('/uploads', express.static('uploads'));
// Using express.json and urlencoded for non-file requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// creating uploads file if ignored from git
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


app.get('/', (req, res) => {
    res.send('dashboard api')
})

app.get('/api/v1', (req, res) => {
    console.log(req.signedCookies)
    res.send('dashboard api')
})

//routes use
app.use('/api/v1/auth', authRouter);

//middlewares use
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)
app.use(sanitizeMiddleware)


//assigning a port
const port = process.env.PORT || 5000;

//Starting Server
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL)
        app.listen(port, console.log(`Server is listening on port ${port}...`))
    } catch (error) {
        console.log(error);
    }
}

start();
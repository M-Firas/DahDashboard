require('dotenv').config();

//express config
const express = require('express')
const app = express();

//packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')

//database connnection
const connectDB = require('./db/connect')

//routers


//not-found middleware 
const notFoundMiddleware = require('./middleware/not-found')
//error handler middleware 
const errorHandlerMiddleware = require('./middleware/error-handler')


//packages use
app.set('trust proxy', 1)
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
}))
app.use(helmet())
app.use(mongoSanitize())

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('dashboard api')
})

app.get('/api/v1', (req, res) => {
    console.log(req.signedCookies)
    res.send('dashboard api')
})

//routes use


//middlewares use
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)


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
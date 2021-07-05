if(process.env.NODE_ENV !== "production"){//PROCESSING THE .ENV FILE
    require('dotenv').config();
}
//console.log(process.env.SECRET);



const express = require('express');
const helmet = require("helmet");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const errorAsync = require('./utils/errorAsync');//for accessing the Async Error File
const expressError = require('./utils/ExpressError');//for accessing the Express Error File
const Joi = require('joi');
const methodOverride = require('method-override'); // overriding the method
const passport = require('passport');
const passportLocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');

const routesTemples = require('./routes/temples');
const routesReviews = require('./routes/reviews'); 
const routesUsers = require('./routes/users'); 
const User = require('./models/user');
const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpTemple';
//mongodb://localhost:27017/YelpCamp 
mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const database = mongoose.connection;
database.on("error",console.error.bind(console,"Mongo Connection Error"));
database.once("open",()=>{
    console.log("MongoDB Connected");
})
app.engine('ejs',ejsMate)
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))//Static assets
app.use(mongoSanitize());//To replace prohibited characters with _, use
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

const secret = process.env.SECRET || 'thesecretisalliswell';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 // time period in seconds
})

store.on("erroe",function(e){
    console.log("Session Error!",e)
})
const sessionSecret = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,//options in the cookie
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 //	2021-06-29T05:05:41.185Z after one week the cookie will expire
    }
}
app.use(session(sessionSecret))
app.use(flash());
app.use(helmet());//automatically initialize the 11 Middleware

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "http://cdn.jsdelivr.net/",
    "https://unpkg.com/",
    "https://fonts.gstatic.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {

            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dav756m1j/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    //console.log(req.session)
    console.log(req.body)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser',async(req,res)=>{
    const fakeUser = new User({email:'fakeuser@ggmail.com',username:'fakeuser'});
    const newUser = await User.register(fakeUser,'resuekaf');
    res.send(newUser)

})
app.use('/',routesUsers);
app.use('/temples',routesTemples);
app.use('/temples/:id/reviews',routesReviews);
//home
app.get('/',(req,res)=>{
    res.render('home')
})


app.all('*',(req,res,next)=>{
    //res.send('404 Error!')
  next(new expressError('Not Found',404));
})
//default error handler
app.use((err,req,res,next)=>{
    //res.send('Something went Wrong||')
    const { status = 500 } = err;
    if(!err.message) err.message = 'Something went wrong'
    res.status(status).render('error',{err});
})

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Serving on port ${port}`);
})

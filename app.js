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

const routesCampgrounds = require('./routes/campgrounds');
const routesReviews = require('./routes/reviews'); 
const routesUsers = require('./routes/users'); 
const User = require('./models/user');
const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp';
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
    "http://cdn.jsdelivr.net/"
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
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvjo2ny5l/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
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
//output
//{"_id":"60d2032aa9428b43d0aab8c1","email":"fakeuser@ggmail.com","username":"fakeuser","salt":"e79ee51081c48227b5a8174a15aa49cd0b213b80063675882e48f50a2eee9b70","hash":"5bcc1bd1e33a571e3e471b3129f855fa595256410efb4396be8b8f99becb2d85046d46f5ce34650990550cfbdc7a4e4c0087f7eb47c6cf0b2d08954cc007b0978786e313cae7c431e177547b9ae6f0e22c7771521f997084488caad28af4a8e7b7107fcce43ead0b14e6dbadee4c2e909e91b40ea0131f52b9b79f0c2218ef88d15f23ecb237aa71db60b1a26db04df6b90a13d0103b31302f79cb22c772c4aa05661be14cfe6f8a1d45d271a841f9e0f6110cfcd96c7c9b86c0aee82e46636b83ac5e9baf0c470f6439b59627b60c440b117efbbe369ad8b865781605847fab1942027703dfc55e35cac3287a6cf0b29a470b18b804874c13f44d6bba1ede5de3173f568696a4af4d54f2e184c99b748246c1ac65b0db2e33d5f5219f150bc07bce2097ad4fae8cfcd79fdf3be9aa9ca66f5e3ad78279cb1a89ab6a7f165f135bc8e421ac0cc5a68e665e8bbf53c0bf7e65e3f091923f3ae0dc80d800bd282f9fec195071748c31a8edd22376eb6f7f72a973ae685d188a652432c129ac47de0b01b1ab7e8eec6b66fc06def2737fa8ef2fb3724d444bd9616b2f9cafd938741705cfa5d9d2f10a7ed8e088f365071dac89b89dee786fcd135296fc2c168079943c00e906164629e956b11f07419358b550eca116fae400facb31a5ffec42265034992ebea1ec6059c4ca28e394a2050f7700db5feafd14774fc24ec6dc014c","__v":0}

app.get('/fakeUser',async(req,res)=>{
    const fakeUser = new User({email:'fakeuser@ggmail.com',username:'fakeuser'});
    const newUser = await User.register(fakeUser,'resuekaf');
    res.send(newUser)

})
app.use('/',routesUsers);
app.use('/campgrounds',routesCampgrounds);
app.use('/campgrounds/:id/reviews',routesReviews);
//home
app.get('/',(req,res)=>{
    res.render('home')
})


// app.get('/makecamp',errorAsync(async(req,res)=>{
//     const makeCamp = new Campground({title: 'My Camp',description:'Very cheap camping!'})//Checing the data will be storing in the database
//     await makeCamp.save();//saving to the database
//     res.send(makeCamp);//sending the data to http request page
// }))
//


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
app.listen(3000,()=>{
    console.log("ON PORT 3000");
})
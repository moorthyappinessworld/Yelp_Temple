const express =  require('express');
const router = express.Router();
const errorAsync = require('../utils/errorAsync');//for accessing the Async Error File
const camps = require('../controllers/campgrounds');
const {isLoggedIn, checkCampground, isVerifyAuthor} = require('../middleware');
const multer  = require('multer')
const { storage } = require('../cloudinary/index')
//const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage })

router.route('/')
    .get(errorAsync(camps.home))//listing the all campgrounds
    .post(isLoggedIn,upload.array('image'),checkCampground,errorAsync(camps.createNewCamp));//creating new campground and stored to database
//single file upload
    // .post(upload.single('image'),(req,res)=>{
    //     //res.send(req.body,req.file)
    //     console.log(req.body,req.file)
    //     res.send("It worked")
    // })
//multiple files upload
    // .post(upload.array('image'),(req,res)=>{
    //     //res.send(req.body,req.file)
    //     console.log(req.body,req.files)
    //     res.send("It worked")
    // })
//creating new campground
router.get('/new',
    isLoggedIn, 
    camps.renderNewCamp);
router.route('/:id')
    .get(errorAsync(camps.viewCamp))//find the campground by id 
    .put(isLoggedIn, 
        isVerifyAuthor, 
        upload.array('image'),
        checkCampground, 
        errorAsync(camps.updateCamp))//Find by id and update the campground
    .delete(isLoggedIn, 
        isVerifyAuthor, 
        errorAsync(camps.deleteCamp));//Find by id and delete the campground
//listing the all campgrounds
// router.get('/', errorAsync(camps.home));

//creating new campground and stored to database
// router.post('/',isLoggedIn,checkCampground,errorAsync(camps.createNewCamp));
//find the campground by id 
// router.get('/:id',errorAsync(camps.viewCamp))
//find the campground by id and edit
router.get('/:id/edit', 
    isLoggedIn, 
    isVerifyAuthor, 
    errorAsync(camps.renderEditCamp));
//Find by id and update the campground
// router.put('/:id',isLoggedIn, isVerifyAuthor, checkCampground, errorAsync(camps.updateCamp))
// //Find by id and delete the campground
// router.delete('/:id', isLoggedIn, isVerifyAuthor, errorAsync(camps.deleteCamp))

module.exports = router;
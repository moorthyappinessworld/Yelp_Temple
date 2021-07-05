const express =  require('express');
const router = express.Router();
const errorAsync = require('../utils/errorAsync');//for accessing the Async Error File
const temple = require('../controllers/temples');
const {isLoggedIn, checkTemple, isVerifyCreator} = require('../middleware');
const multer  = require('multer')
const { storage } = require('../cloudinary/index')
//const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage })

router.route('/')
    .get(errorAsync(temple.home))//listing the all campgrounds
    .post(isLoggedIn,upload.array('image'),checkTemple,errorAsync(temple.createNewTemple));//creating new campground and stored to database

//creating new temple
router.get('/new',
    isLoggedIn, 
    temple.renderNewTemple);
router.route('/:id')
    .get(errorAsync(temple.viewTemple))//find the campground by id 
    .put(isLoggedIn, 
        isVerifyCreator, 
        upload.array('image'),
        checkTemple, 
        errorAsync(temple.updateTemple))//Find by id and update the campground
    .delete(isLoggedIn, 
        isVerifyCreator, 
        errorAsync(temple.deleteTemple));//Find by id and delete the campground
//find the campground by id and edit
router.get('/:id/edit', 
    isLoggedIn, 
    isVerifyCreator, 
    errorAsync(temple.renderEditTemple));

module.exports = router;
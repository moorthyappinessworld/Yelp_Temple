const express =  require('express');
const router = express.Router({mergeParams:true});//all params are merged in this file .. for accessing the ID
const errorAsync = require('../utils/errorAsync');//for accessing the Async Error File
const {checkReview,isLoggedIn,isVerifyReviewCreator} = require('../middleware');

const reviews = require('../controllers/reviews');

router.post('/',isLoggedIn,checkReview,errorAsync(reviews.addReview))

router.delete('/:reviewId',isLoggedIn,isVerifyReviewCreator,errorAsync(reviews.deleteReview))

module.exports =router;
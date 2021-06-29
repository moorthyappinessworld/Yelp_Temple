const Review = require('../models/review');
const Campground = require('../models/campground');
module.exports.addReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    const saveReview = await review.save();
    const saveCamp = await campground.save();
    console.log(saveReview)
    console.log(saveCamp)
    req.flash('success',`New Review is created`)
    res.redirect(`/campgrounds/${campground._id}`);
    // let camp = await Campground.findById(req.params.id);
    // let review = new Review(res.body.review);
    // console.log(camp);
    //  console.log("review");
}

module.exports.deleteReview = async(req,res)=>{
    //console.log(req.params);
    //res.send("Delete")
    const { id, reviewId } = req.params; //getting reviewId,id from params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//deleting reviewId from campground database
    await Review.findByIdAndDelete(reviewId); //Deleting review from the review database
    req.flash('success',`The Review is deleted Successfully`)
    res.redirect(`/campgrounds/${id}`); //redirect to the Campground/id page
}
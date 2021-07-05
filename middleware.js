const expressError = require('./utils/ExpressError');//for accessing the Express Error File
const BaseJoi = require('joi');
const Campground = require('./models/campground');
const Temple = require('./models/temple');
const Review = require('./models/review');
const sanitizeHtml = require('sanitize-html');
//sanitize the HTML tags while entering the input fields
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': `{{#label}} must not include HTML!`
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean!==value) return helpers.error('string.escapeHTML',{value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

//checking the user logged in or not
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be Signned-In')
        return res.redirect('/login');
    }
    next();
}



module.exports.checkTemple= (req, res, next) => {
    const templeSchema = Joi.object({
        temple: Joi.object({
            title: Joi.string().required().escapeHTML(),//title must required with string data type
            //image:Joi.string().required(),//image must required with string data type
            price: Joi.number().required().min(1),//price must required with number data type (min value must be 0)
            description: Joi.string().required().escapeHTML(),//description must required with string data type
            location: Joi.string().required().escapeHTML(),//location must required with string data type
            //population: Joi.string().required().escapeHTML()
            contact: Joi.number().required().min(1).max(10000000000),
            website: Joi.string().required().escapeHTML(),
        }).required(),
        deleteImages: Joi.array()
    })
    const { error } = templeSchema.validate(req.body);
    if (error) {
        const resultMessage = error.details.map(e => e.message).join(',')//getting the details of error message and store into the "resultMessage"
        throw new expressError(resultMessage, 400)//throwing the resultMessage to the HTTP Request Page.
    } else {
        next();
    }
    console.log(error);
}

module.exports.isVerifyAuthor = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', `Do not have permission to Edit or Update Campground`)
        res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isVerifyCreator = async (req, res, next) => {
    const { id } = req.params;
    const temple = await Temple.findById(id);
    if (!temple.author.equals(req.user._id)) {
        req.flash('error', `Do not have permission to Edit or Update Temple`)
        res.redirect(`/temples/${id}`)
    }
    next();
}

module.exports.isVerifyReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const verifyReview = await Review.findById(reviewId);
    if (!verifyReview.author.equals(req.user._id)) {
        req.flash('error', `Do not have permission to Edit or Update Campground`)
        res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isVerifyReviewCreator = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const verifyReview = await Review.findById(reviewId);
    if (!verifyReview.author.equals(req.user._id)) {
        req.flash('error', `Do not have permission to Edit or Update Temple`)
        res.redirect(`/temples/${id}`)
    }
    next();
}

module.exports.checkReview = (req, res, next) => {
    const reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            body: Joi.string().required().escapeHTML()
        }).required()
    })
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const resultMessage = error.details.map(e => e.message).join(',')//getting the details of error message and store into the "resultMessage"
        throw new expressError(resultMessage, 400)//throwing the resultMessage to the HTTP Request Page.
    } else {
        next();
    }

}

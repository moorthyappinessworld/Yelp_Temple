const Campground = require('../models/campground');
const mbxGeo = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAP_BOX_TOKEN;
const geoCoder = mbxGeo({accessToken:mapBoxToken})//instantiate new map box geocoding instance
const { cloudinary } = require("../cloudinary");
module.exports.home = (async (req, res) => {
    const campgrounds = await Campground.find({});
    //console.log(campgrounds);
    res.render('campgrounds/index-home', { campgrounds })
})

module.exports.renderNewCamp = async (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createNewCamp = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    console.log(geoData.body.features[0].geometry);
    //res.send(geoData.body.features[0].geometry);
    // res.send("Okay!!")
    // console.log(geoData)
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(file => ({ imageurl: file.path, imagename: file.filename }))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', `The New Campground Added Successfully`)
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.viewCamp = async (req, res) => {
    //populating revieews with nested
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', `Campground not found!`);
        return res.redirect(`/campgrounds`)
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditCamp = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', `Campground not found!`);
        return res.redirect(`/campgrounds`)
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCamp = async (req, res) => {
    // console.log("Hi");
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const { id } = req.params;
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    campground.geometry = geoData.body.features[0].geometry;
    const editImages = req.files.map(file => ({ imageurl: file.path, imagename: file.filename }));
    campground.images.push(...editImages)
    //console.log(campground);
    await campground.save();
    if (req.body.deleteImages) {
        for(let imagename of req.body.deleteImages){
            await cloudinary.uploader.destroy(imagename);
        }
        await campground.updateOne({ $pull: { images: { imagename: { $in: req.body.deleteImages } } } })
        console.log(campground);
    }
    req.flash('success', `${campground.title} Campground Updated Successfully`)
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCamp = async (req, res) => {
    ///console.log(req.params)
    // const  title1  = req.params.title;
    // console.log(title1)
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', `The Campground is deleted Successfully!`)
    res.redirect('/campgrounds')
}
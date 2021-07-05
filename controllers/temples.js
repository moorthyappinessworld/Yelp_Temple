const Temple = require('../models/temple');
const mbxGeo = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAP_BOX_TOKEN;
const geoCoder = mbxGeo({accessToken:mapBoxToken})//instantiate new map box geocoding instance
const { cloudinary } = require("../cloudinary");
module.exports.home = (async (req, res) => {
    const temples = await Temple.find({});
    res.render('temples/index', { temples })
})

module.exports.renderNewTemple = async (req, res) => {
    res.render('temples/new')
}

module.exports.createNewTemple = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.temple.location,
        limit: 1
    }).send()
    
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();
    //console.log(time);
    // res.send(`Date: ${date} `)
    // console.log(geoData.body.features[0].geometry);
    // res.send(geoData.body.features[0].geometry);
    // res.send("Okay!!")
    // console.log(geoData)
    const temple = new Temple(req.body.temple);
    temple.postdate = date;
    temple.posttime = time;
    temple.geometry = geoData.body.features[0].geometry;
    temple.images = req.files.map(file => ({ imageurl: file.path, imagename: file.filename }))
    temple.author = req.user._id;
    await temple.save();
    //console.log(temple)
    req.flash('success', `The New Temple Added Successfully`)
    res.redirect(`/temples/${temple._id}`)
}

module.exports.viewTemple = async (req, res) => {
    //populating revieews with nested
    const temple = await Temple.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //console.log(temple)
    if (!temple) {
        req.flash('error', `Temple not found!`);
        return res.redirect(`/temples`)
    }
    res.render('temples/view', { temple })
}

module.exports.renderEditTemple = async (req, res) => {
    const { id } = req.params;
    const temple = await Temple.findById(id);
    if (!temple) {
        req.flash('error', `Temple not found!`);
        return res.redirect(`/temples`)
    }
    res.render('temples/edit', { temple })
}

module.exports.updateTemple = async (req, res) => {
    // console.log("Hi");
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.temple.location,
        limit: 1
    }).send()
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes();
    const { id } = req.params;
    // console.log(req.body);
    const temple = await Temple.findByIdAndUpdate(id, { ...req.body.temple });
    temple.postdate = date;
    temple.posttime = time;
    temple.geometry = geoData.body.features[0].geometry;
    const editImages = req.files.map(file => ({ imageurl: file.path, imagename: file.filename }));
    temple.images.push(...editImages)
    await temple.save();
    if (req.body.deleteImages) {
        for(let imagename of req.body.deleteImages){
            await cloudinary.uploader.destroy(imagename);
        }
        await temple.updateOne({ $pull: { images: { imagename: { $in: req.body.deleteImages } } } })
        //console.log(temple);
    }
    req.flash('success', `${temple.title} Temple Updated Successfully`)
    res.redirect(`/temples/${temple._id}`)
}

module.exports.deleteTemple = async (req, res) => {
    await Temple.findByIdAndDelete(req.params.id);
    req.flash('success', `The Temple is deleted Successfully!`)
    res.redirect('/temples')
}
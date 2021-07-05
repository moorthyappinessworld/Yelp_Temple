const mongoose = require('mongoose');
const Review = require('./review')
const schema = mongoose.Schema;

const ImageSchema = new schema({
    imageurl:String,
    imagename:String,
})
//changing the width of the images
ImageSchema.virtual('thumbnail').get(function(){
    return this.imageurl.replace('/upload','/upload/w_300')
});
const opts = { toJSON: { virtuals: true } };//virtual in JSON
const TempleSchema = new schema({
    title:String,
    images:[ImageSchema],
    geometry:{
        type: {
            type: String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price:Number,
    description: String,
    location: String,
    contact: Number,
    website: String,
    postdate:String,
    posttime: String,
    author:{
        type: schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[{
        type: schema.Types.ObjectId,
        ref: 'Review'
    }]
},opts);

TempleSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/temples/${this._id}">${this.title}</a><strong>
            <p>${this.description.substring(0,30)}<p>`
});
//deleting all reviews whie deleting the Specific Temple
TempleSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Temple',TempleSchema);
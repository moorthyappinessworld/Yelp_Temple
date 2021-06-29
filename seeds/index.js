const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/YelpCamp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
})

const database = mongoose.connection;
database.on("error",console.error.bind(console,"Mongo Connection Error"));
database.once("open",()=>{
    console.log("MongoDB Connected");
})

const sampleData = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    // const camp = new Campground({title:'Coimbatore Camp'}) //Checing the single data will be storing in the database
    // await camp.sace();//saving to the database
    for(let i=0;i<300;i++){
        const randomCamp = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+100;
        const camps =new Campground({
            author: '60d45009a82f7025f093ba1e',
            location: `${cities[randomCamp].city},${cities[randomCamp].state}`,
            population: `${cities[randomCamp].population}`,
            title: `${sampleData(descriptors)} ${sampleData(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci veritatis nostrum veniam nulla inventore voluptatum asperiores, saepe corporis molestias minus recusandae accusantium pariatur labore nobis. Possimus minus veniam debitis harum!',
            price: price,
            geometry: { 
                type: 'Point',
                coordinates: [ 
                    cities[randomCamp].longitude,
                    cities[randomCamp].latitude
                 ] 
            },
            images:[
                {
                imageurl: 'https://res.cloudinary.com/dvjo2ny5l/image/upload/v1624553223/YelpCamp/vuhso0ssuik09ejfkptd.jpg',
                imagename: 'YelpCamp/vuhso0ssuik09ejfkptd'
              },
              {
                imageurl: 'https://res.cloudinary.com/dvjo2ny5l/image/upload/v1624553223/YelpCamp/rw8gzfrgh8nzqsnkwpph.jpg',
                imagename: 'YelpCamp/rw8gzfrgh8nzqsnkwpph'
              }
            ]
          
        })
        await camps.save();
    }
}
seedDB().then((dta)=>{
    console.log(dta);
    mongoose.connection.close();
});//calling the seedDB 
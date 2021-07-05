const User = require('../models/user');
module.exports.newUserRegister = (req,res)=>{
    res.render('users/register')
}

module.exports.userRegister = async(req,res,next)=>{
    console.log(req.body);
    try{
        const {username,email,password} = req.body;
        const newUser = new User({username,email});
        const registeredNewUser = await User.register(newUser,password);
        //console.log(registeredNewUser);
        //requesting the login while registering the new user
        req.login(registeredNewUser,err=>{
            if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp');
            res.redirect('/temples')
        })

    } catch(e){
        req.flash('error',e.message);
        res.redirect('register')
    }
}
module.exports.renderLogin = (req,res)=>{
    res.render('users/login')
}

module.exports.userLogin = (req,res)=>{
    console.log(req.body);
    // req.flash('success','Welcome back to Yelp Camp');
    // res.redirect('/campgrounds')
    const redirectUrl = req.session.returnTo || '/temples';
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}
module.exports.userLogout = (req,res)=>{
    req.logout();
    req.flash('success','Good Bye by Yelp Camp');
    res.redirect('/temples')
}
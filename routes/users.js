const express = require('express');
const router = express.Router();
const errorAsync = require('../utils/errorAsync');
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.newUserRegister)//viewing register page for new user
    .post(errorAsync(users.userRegister));//registering the new user and stores the user data to the database

router.route('/login')
    .get(users.renderLogin)
//while login the password.authenticate('local',{failureFlash:true,failureRedirect:'/login'}) method checks 
//the username and password and moves to the appropriate pages
//failureFlash:true => returns the flash message while login will be failure
//failureRedirect:'/login' => moves to the /login page while login will be failure
    .post(
        passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),
        users.userLogin);
//logout the current user
router.get('/logout',
        users.userLogout);
// router.get('/register',users.renderNewRegister);
//registering the new user and stores the user data to the database
// router.post('/register',errorAsync(users.userRegister));
// router.get('/login',users.renderLogin);
//while login the password.authenticate('local',{failureFlash:true,failureRedirect:'/login'}) method checks 
//the username and password and moves to the appropriate pages
//failureFlash:true => returns the flash message while login will be failure
//failureRedirect:'/login' => moves to the /login page while login will be failure
// router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.userLogin);
// router.get('/logout',users.userLogout);
module.exports = router;
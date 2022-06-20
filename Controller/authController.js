const authModel = require('../Model/auth');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// exports.registrationForm = (req, res) => {
//     let message = req.flash('error');
//     console.log(message);
//     if(message.length>0)
//     {
//         message=message[0];
//     }
//     else
//     {
//         message=null;
//     }
//     res.render('Auth/registration', {
//         titlePage: "Registration Form",
//         path: '/registration',
//         errorMsg: message,
//     })
// }

exports.postRegistrationData = (req, res) => {
    console.log("Collected value :", req.body);
    const f_name = req.body.fname;
    const l_name = req.body.lname;
    const email = req.body.email;
    const password = req.body.pwd;
    console.log("Collected data from the registration form", f_name, l_name, email, password);
    if(!f_name){
        return res.status(401).json({
            success: false,
            message: "First name is required"
        })
    }
    else if(!l_name){
        return res.status(401).json({
            success: false,
            message: "Last name is required"
        })
    }
    else if(!email){
        return res.status(401).json({
            success: false,
            message: "Email is required"
        })
    }
    else if(!password){
        return res.status(401).json({
            success: false,
            message: "Password is required"
        })
    }
    else{
    authModel.findOne({ email: email })
        .then(userValue => {
            if (userValue) {
                return res.status(401).json({
                    success: false,
                    message: "Email is already exist"
                })
            }
            return bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const userData = new authModel({fName: f_name, lName: l_name, email: email, password: hashPassword});
                    return userData.save()
                        .then(results => {
                            return res.status(200).json({
                                success: true,
                                message: "Registration successful",
                                result: results
                        }).catch(err => {
                            return res.status(401).json({
                                success: false,
                                message: "Registration unsuccessful"
                        });
                    })
                }).catch(err => {
                    return res.status(401).json({
                        success: false,
                        message: "Error to register"
                })
            });
        })
      })
  }
}

// exports.loginForm = (req, res) => {
//                 let message = req.flash('error');
//                 console.log(message);
//                 if(message.length>0)
//                 {
//                     message=message[0];
//                 }
//                 else
//                 {
//                     message=null;
//                 }
//                 res.render('Auth/login', {
//                     titlePage: "Login Form",
//                     path: '/login',
//                     errorMsg: message,
//                     cookie_data: req.cookies
//                 })
//             }

exports.postLoginData = (req, res) => {
    console.log("Collected login value :", req.body);
    const email = req.body.email;
    const password = req.body.pwd;
    const remember = req.body.remember;
    console.log("Collected data from the login form", email, password);
    if(!email){
        return res.status(401).json({
            success: false,
            message: "Email is required"
        })
    }
    else if(!password){
        return res.status(401).json({
            success: false,
            message: "Password is required"
        })
    }
    else{
    authModel.findOne({ email: email })
        .then(userValue => {
            if (!userValue) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email"
                })
            }
            bcrypt.compare(password,userValue.password)
                .then(result => {
                     if(!result)
                     {
                        return res.status(401).json({
                            success: false,
                            message: "Invalid password"
                        })
                     }else
                     {
                        //  console.log("logged in " + result);
                         req.session.isLoggedIn = true;
                         //isLoggedIn is a user defined variable in a session to check user is logged in or not
                         req.session.user = userValue;
                         //user is a variable in session to store logged in user value
                         return req.session.save(err=>{
                             if(err)
                             {
                                return res.status(401).json({
                                    success: false,
                                    message: err
                                });
                             }
                             else{
                                 const token_jwt = jwt.sign({email: userValue.email},"ABCDE",{expiresIn: '1h'})
                                 return res.status(201).json({
                                     success: true,
                                     message: "Login successfully",
                                     result: userValue,
                                     token: token_jwt
                                 })
                              }
                          })
                      }
                 }).catch(err => {
                                return res.status(401).json({
                                    success: false,
                                    message: err
                        });
         }).catch(err => {
                    return res.status(401).json({
                        success: false,
                        message: err
                })
            })
      })
    }
}

// exports.logoutForm = (req,res) =>{
//         req.session.destroy(err=>{
//             if(err)
//             {
//                 console.log(err);
//             }
//         else
//         {
//             res.redirect('/login');
//         }
//     });
// };
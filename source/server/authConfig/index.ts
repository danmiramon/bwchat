//Passport configuration
import {Strategy as LocalStrategy} from "passport-local";
import {User} from "../models";

let configPassport = function(passport){
    passport.serializeUser(function(user, done){
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });


    //Use the Local Strategy
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done){
            User.findOne({email: email.toLowerCase()}, function(err, user){
                console.log(user);
                if(err){
                    return done(err);
                }

                if(!user){
                    return done(null, false);
                }

                if(!user.validPassword(password)){
                    return done(null, false);
                }

                return done(null, user);

            })
    }))
};



export {configPassport};
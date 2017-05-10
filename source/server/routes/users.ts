//Import the users database
import {User} from "../models";

//User signup
export function signup(req, res, next){
    User.findOne({email: req.body.email}, function(err, user){
        if(user){
            res.json(null);
            return;
        }
        else{
            let newUser = new User();
            newUser.email = req.body.email.toLowerCase();
            newUser.password = newUser.generateHash(req.body.password);
            newUser.save(function(err, user){
                req.login(user, function(err){
                    if(err){
                        return next(err);
                    }
                    res.json(user);
                });
            });
        }
    });
}

//User login
export function login(req, res){
    res.json(req.user);
}

//User logout
export function logout(req, res){
    req.logOut();
    res.send(200);
}

//Logged in verification
export function loggedin(req, res){
    res.send(req.isAuthenticated() ? req.user : '0');
}


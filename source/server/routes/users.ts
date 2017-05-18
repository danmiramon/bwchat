//Import the users database
import * as express from "express";
import {User} from "../models";

//LOGIN MANAGEMENT
//User signup
export function signup(req:express.Request, res:express.Response, next:express.NextFunction){
    User.findOne({email: req.body.email}, function(err, user){
        if(user){
            res.json(null);
            return;
        }
        else{
            let newUser = new User();
            newUser.username = req.body.username;
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
export function login(req:express.Request, res:express.Response){
    res.json(req.user);
}

//User logout
export function logout(req:express.Request, res:express.Response){
    req.logOut();
    res.sendStatus(200);
}

//Logged in verification
export function loggedin(req:express.Request, res:express.Response){
    res.send(req.isAuthenticated() ? req.user : '0');
}


//QUERIES
export function getData(req:express.Request, res:express.Response){
    //User.findOne({_id: req.query.id}, req.query.fields, function(err, user){
    User.findById(req.user._id, req.query.fields, function(err, user){
        if(err){
            throw(err);
        }

        res.json(user);
    });
}

export function updateData(req:express.Request, res:express.Response){
    User.findByIdAndUpdate(req.user._id, req.body, function(err, user){
        if(err){
            throw(err);
        }
    });
}


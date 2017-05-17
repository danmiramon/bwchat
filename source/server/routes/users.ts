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
    res.send(req.isAuthenticated());
}


//SOCKET IO REQUESTS
export function getUser(userId:string){
    //let foundUser;
    User.findOne({_id: userId}, function(err, user){
        if(err) { throw err; }
        return user.toJSON();
    });/*.then(
        (response) => { return response;}
    )*/
}


//Import the users database
import * as express from "express";
import {User, UserList} from "../models";

export function getContactList(req:express.Request, res:express.Response){
    UserList.find({userId:{$in: req.query.contacts}}, function(err, contacts){
        if(err){
            throw(err);
        }

        res.json(contacts);
    });
}
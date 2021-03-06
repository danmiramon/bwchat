//Import the users database
import * as express from "express";
import {UserList} from "../models";

export function getContactList(req:express.Request, res:express.Response){
    UserList.find({userId:{$in: req.query.contacts}}, function(err, contacts){
        if(err){
            throw(err);
        }

        res.json(contacts);
    });
}

export function getAllContacts(req:express.Request, res:express.Response){
    UserList.find({}, function(err, contacts){
        if(err){
            throw(err);
        }

        res.json(contacts);
    });
}
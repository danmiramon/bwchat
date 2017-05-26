//Chat room routes
import * as express from "express";
import {Chat} from "../models";

//Create a chat room

export function createChatRoom(req:express.Request, res:express.Response, next:express.NextFunction){
    Chat.findOne({$and:[{contacts:{$size:req.body.length}}, {contacts:{$all:req.body}}]}, function(err, chat){
        if(chat){
            res.json(null);
            return
        }
        else{
            let newChat = new Chat();
            newChat.contacts = req.body;
            newChat.save(function(err, nChat){
                if(err){
                    return next(err);
                }
                res.json(nChat);
            })
        }
    });
}

export function getChat(req:express.Request, res:express.Response){
    if(req.query.id){
        Chat.findById(req.query.id, function(err, chat){
            if(err){
                throw(err);
            }

            res.json(chat);
        });
    }
    else{
        Chat.findOne({$and:[{contacts:{$size:req.query.contacts.length}}, {contacts:{$all:req.query.contacts}}]}, function(err, chat){
            if(err){
                throw(err);
            }

            res.json(chat);
        });
    }
}
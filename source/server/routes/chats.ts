//Chat room routes
import * as express from "express";
import {Chat} from "../models";

//Create a chat room

export function createChatRoom(req:express.Request, res:express.Response, next:express.NextFunction){
    Chat.findOne({$and:[{contacts:{$size:req.body.length}}, {contacts:{$all:req.body}}]}, function(err, chat){
        let create:boolean = true;

        if(chat){
            if(req.body.length > 2){
                create = false;
            }
            else{
                create = false;
                Chat.findOne({$and:[{contacts:{$size:req.body.length}}, {contacts:{$all:req.body}}, {groupRoom:false}]}, function(err2, chat2){
                    if(!chat2){
                        create = true;
                    }
                });
            }
        }


        if(create){
            let newChat = new Chat();
            newChat.contacts = req.body;
            newChat.groupRoom = req.body.length !== 2;
            newChat.save(function(err, nChat){
                if(err){
                    return next(err);
                }
                res.json(nChat);
            });
        }
        else{
            res.json(null);
            return;
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
        if(req.query.privateChat){
            Chat.findOne({$and:[{contacts:{$size:req.query.contacts.length}}, {contacts:{$all:req.query.contacts}}, {groupRoom:false}]}, function(err, chat){
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
}

export function deleteChatRoom(req:express.Request, res:express.Response){
    Chat.findByIdAndRemove(req.query.id, function(err, chat){
        if(err){
            throw(err);
        }
        res.json(chat);
    })
}

export function updateChatRoom(req:express.Request, res:express.Response){
    Chat.findByIdAndUpdate(req.body.id, req.body.data, function(err, chat){
        if(err){
            throw(err);
        }
        res.json(chat);
    });
}

export function insertMessage(req:express.Request, res:express.Response){
    req.body.message.date = new Date();
    //Search for the correct chat room to insert the message
    Chat.findByIdAndUpdate(req.body.id,
        {$push: {messages: req.body.message}},
        {upsert:true, new:true},
        function(err,inserted){
            if(err){
                throw(err);
            }
            res.json(req.body.message);
        });
}

export function getChatLength(req:express.Request, res:express.Response){
    //Get the number of messages in the chat
    Chat.findById(req.query.id, function(err, chat){
        if(err){
            throw(err);
        }
        res.json(chat['messages'].length);
    });
}

export function getChatMessges(req:express.Request, res:express.Response){
    //Get the number of messages in the chat
    Chat.find({_id:req.query.id}, function(err, chat){
        if(err){
            throw(err);
        }

        let messages = chat[0]['messages'];
        messages.sort(function(a,b){
            return a.date - b.date;
        });

        let pn = parseInt(req.query.pageNumber),
            size = parseInt(req.query.pageSize),
            from = pn * size,
            to = from + size;

        res.json(messages.slice(from, to));

    });
}
//Import the users database
import * as express from "express";
import * as mongoose from "mongoose";
import {User, UserList, Chat} from "../models";
import {userInfo} from "os";

//LOGIN MANAGEMENT
//User signup
export function signup(req:express.Request, res:express.Response, next:express.NextFunction){
    User.findOne({email: req.body.email}, function(err, user){
        if(user){
            res.json(null);
            return;
        }
        else{
            //Create a user in the User Database
            let newUser = new User();
            newUser.username = req.body.username;
            newUser.email = req.body.email.toLowerCase();
            newUser.password = newUser.generateHash(req.body.password);
            newUser.save(function(err, user){
                req.login(user, function(err){
                    //On creation add it also to the User List
                    let newListUser = new UserList();
                    newListUser.userId = user._id;
                    newListUser.username = req.body.username;
                    newListUser.save(function(err, userList){
                        if(err){
                            return next(err);
                        }
                    });

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
    User.findOne(JSON.parse(req.query.searchBy), req.query.fields, function(err, user){
        if(err){
            throw(err);
        }

        res.json(user);
    });
}

export function updateData(req:express.Request, res:express.Response){
    //Update the user information
    User.findByIdAndUpdate(req.user._id, req.body, function(err, user){

        //Update its information in the User List
        UserList.findOneAndUpdate({userId: req.user._id},
            {username: req.body.username, profilePicture: req.body.profilePicture},
        function(err, userList){
            if(err){
                throw(err);
            }
        });

        //Update information in contact
        User.update({contacts:{$elemMatch:{contactId: req.user._id}}},
            {$set: {'contacts.$.username': req.body.username, 'contacts.$.profilePicture': req.body.profilePicture}},
            {multi:true});

        //Update the information in the chat list
        Chat.find({contacts:req.user._id, groupRoom:false})
            .select('contacts')
            .exec(function(err, chats){
                for(let chat of chats){
                    for(let contact of chat.contacts){
                        if(contact.toString() !== req.user._id.toString()){
                            User.findOneAndUpdate({_id: contact, chats:{$elemMatch:{chatId: chat._id}}},
                                {$set: {'chats.$.chatPicture': req.body.profilePicture}},
                            function(err,change){
                                if(err){
                                    throw(err);
                                }
                            });
                        }
                    }
                }
            });

        if(err){
            throw(err);
        }

        res.json(user);
    });
}

export function insertUpdateContact(req:express.Request, res:express.Response){
    //Search if we have the contact in the contact list, if we do, update it, else, insert it
    User.findOneAndUpdate({'_id':req.body.id, 'contacts.contactId':req.body.contact.contactId},
        {$set: {'contacts.$': req.body.contact}},
        {new:true},
        function(err, contact){
            if(err){
                throw(err);
            }

            //In case the contact is not found in the user's list, insert it
            if(!contact){
                User.findOneAndUpdate({'_id':req.body.id},
                    {$push: {contacts: req.body.contact}},
                    {upsert:true, new:true},
                    function(err,inserted){
                        if(err){
                            throw(err);
                        }
                        res.json(inserted);
                    }
                )
            }
            else{
                res.json(contact);
            }
        });
}

export function deleteUserContact(req:express.Request, res:express.Response){
    User.findByIdAndUpdate(req.query.userId,
        {$pull:{contacts:{contactId:{$in:req.query.contacts}}}},
        function(err, user){
            if(err){
                throw(err);
            }

            res.json(user);
        }
    );
}

export function deleteUserChat(req:express.Request, res:express.Response){
    User.findByIdAndUpdate(req.query.userId,
        {$pull:{chats:{chatId:{$in:req.query.chats}}}},
        function(err, chat){
            if(err){
                throw(err);
            }

            res.json(chat);
        }
    );
}

export function getUserContact(req:express.Request, res:express.Response){
    User.findById(req.query.contactFrom, {contacts:{$elemMatch:{contactId: req.query.contactTo}}}, function(err, user){
        if(err){
            throw(err);
        }

        res.json(user);
    });
}

export function insertUserChat(req:express.Request, res:express.Response){
    User.findOneAndUpdate({'_id':req.body.id},
        {$push: {chats: req.body.chat}},
        {upsert:true, new:true},
        function(err, user){
            if(err){
                throw(err);
            }
            res.json(req.body);
        }
    );
}

//Used to update the current user in the contacts documents
export function updateUserProfileInContact(req:express.Request, res:express.Response){
    User.findOneAndUpdate({_id: req.body.id, contacts:{$elemMatch:{contactId:req.user._id}}},
        {$set:{'contacts.$.profilePicture': req.body.profilePicture, 'contacts.$.username': req.body.username}},
        {new: true},
        function(err, user){
            if(err){
                throw(err);
            }
            res.json(user);
        })
}

//Used to update the one-to-one chat
export function updateUserContactChat(req:express.Request, res:express.Response){
    User.findOneAndUpdate({_id: req.user._id, chats:{$elemMatch:{chatId:req.body.chatId}}},
        {$set:{'chats.$.chatname': req.body.chatname}},
        {new: true},
        function(err, user){
            if(err){
                throw(err);
            }
            res.json(user);
        })
}


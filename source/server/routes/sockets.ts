import * as socketio from "socket.io";
import {User} from "../routes"

let io;

export function setIO(sio){
    io = sio;

    io.on('connection',function (socket){
        console.log("Connected to guest: " + socket.id);
        socket.on('logged in', function(data){
            socket.emit('get login data', data[0]);
        });

        //FOR TESTING CHECK THE CONNECTED ROOMS
        socket.on('get rooms', function(){
            console.log(socket.rooms);
            io.emit('roomies', socket.rooms);
        });

        //Join a room
        socket.on('join room', function(data){
            socket.join(data[0]);
        });

        socket.on('join chat room', function(data){
            socket.join(data[0]);
            io.to(data[1]).emit('open chat');
        });

        //Leave a room
        socket.on('leave room', function(room){
            socket.leave(room[0]);
        });

        //CONTACTS
        //Profile data updates
        socket.on('contact profile update', function(data){
            io.to(data[0]).emit('update contact profile', [...data.splice(1, data.length)]);
        });

        //User Chat list data update
        socket.on('contact chat update', function(data){
            io.to(data[0]).emit('update contact chat', [...data.splice(1, data.length)])
        });

        //Alert that new contacts have been added, send a message to load them into the list
        //Receive the room of the user to be notified
        socket.on('new contacts', function(data){
            console.log('New contacts for: ' + data[0]);
            io.to(data[0]).emit('contacts added', [...data.splice(1, data.length)]);
        });

        //Receive an alert of contact deletion, reply to the contact to remove from list
        socket.on('contact deleted', function(data){
            console.log('Deleting user: ' + data[1] + ' in user ' + data[0]);
            io.to(data[0]).emit('remove contact', data[1]);
        });

        socket.on('chat deleted', function(data){
            console.log('Deleting chat: ' + data[1] + ' in user ' + data[0]);
            io.to(data[0]).emit('remove chat', data[1]);
        });

        //Accept contact request, notify the user
        socket.on('accept request', function(data){
            console.log('User: ' + data[1] + ' accepted the request from contact ' + data[0]);
            io.to(data[0]).emit('request accepted', data[1]);
        });



        //CHATS
        //TODO Refactor on necessity
        //Alert that a new chat room have been created, send a message to load it
        //Receive the room of the user to be notified
        socket.on('chat room added', function(data){
            io.to(data[0].id).emit('added new chat room', data[0].chat);
        });

        //Receive an alert of chat deletion, reply to the contacts to remove from list
        // socket.on('chat deleted', function(data){
        //     console.log('Removing chat room');
        //     io.to(data[0].room).emit('remove chat', data[0].contact);
        // });
    });
}

//To emit messages to a given room
//io.to(room).emit('joined', 'connected to room');
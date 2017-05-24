import * as socketio from "socket.io";
import {User} from "../routes"

let io;

export function setIO(sio){
    io = sio;

    io.on('connection',function (socket){
        console.log("Connected to guest: " + socket.id);

        //Join a room
        socket.on('join room', function(room){
            socket.join(room);
        });

        //Alert that new contacts have been added, send a message to load them into the list
        //Receive the room of the user to be notified
        socket.on('new contacts', function(room){
            console.log('New contacts for: ' + room);
            io.to(room).emit('load contacts');
        });

        //Receive an alert of contact deletion, reply to the contact to remove from list
        socket.on('contact deleted', function(data){
            console.log('Deleting user: ' + data[0].contact + ' in user ' + data[0].room);
            io.to(data[0].room).emit('remove contact', data[0].contact);
        });

        //Accept contact request, notify the user
        socket.on('accept request', function(data){
            console.log('User: ' + data[0].contact + ' accepted the request from contact ' + data[0].room);
            io.to(data[0].room).emit('request accepted', data[0].contact);
        })
    });
}

//To emit messages to a given room
//io.to(room).emit('joined', 'connected to room');
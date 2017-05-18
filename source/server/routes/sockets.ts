import * as socketio from "socket.io";
import {User} from "../routes"

export function connection(socket){
    console.log("Connected to guest: " + socket.id);

    socket.on('login', function(){
        socket.emit('logged');
    });
}
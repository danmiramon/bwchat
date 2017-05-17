import * as socketio from "socket.io";
import {User} from "../routes"

export function connection(socket){
    console.log("Connected to guest: " + socket.id);

    //Gets User data
    //'fields' is an array, the first argument is the User ID to retrieve data from, the rest are the fields
    socket.on('getUserData', function(fields, fn){
        //console.log(fields);
        let user = User.getUser(fields[0]);
        console.log(user);
    })
}
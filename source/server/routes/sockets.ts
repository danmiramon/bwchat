import * as socketio from "socket.io";

export function connection(socket){
    console.log("Connected to guest: " + socket.id);
    let count = 0;
    socket.on('messages', function(data){
        console.log("Message:" + data.message + " from " + socket.id);
        socket.emit("receive", ++count + " message received: " + data);
    })
}
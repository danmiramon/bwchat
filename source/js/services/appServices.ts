angular.module("chatApp")
.factory("sio", function(){
    let socket:SocketIOClient.Socket;

    return {
        logged: null,

        connect: function(userId:string){
            socket = io.connect('http://localhost:3000');
            this.logged = userId;
        },

        on: function(event:string, callback:Function){
            socket.on(event, callback);
        },

        //Send at most two parameters to the server: array of arguments and an aknowlegment function
        emit: function(event:string, ...args:any[]){
            if(typeof args[args.length-1] === 'function'){
                socket.emit(event, args.slice(0, args.length-1), args[args.length-1]);
            }
            else{
                socket.emit(event, args);
            }
        },

        close: function(){
            this.logged = null;
            socket.close();
        }
    }
});
angular.module("chatApp")
.factory("chatProfile", ["$q", "$http", "$location", function($q:angular.IQService,
                                  $http:angular.IHttpService,
                                  $location:angular.ILocationService){
    let user = {
        error: null,
        cookie: null
    };

    return {
        //Checks if the user is logged, by checking the cookie object
        logged: function(){
            // return user.cookie ? true : false;
            return !!user.cookie;
        },

        setCookie: function(data){
            user.cookie = data;
            return this;
        },

        getCookie: function(){
            return user.cookie;
        },

        getCookieData: function(field){
            return user.cookie ? user.cookie[field] : null;
        },

        setError: function(message){
            user.error = message;
            return this;
        },

        getError: function(){
            return user.error;
        },

        checkLoggedin: function(){
            let deferred = $q.defer();

            $http.get('/loggedin').then(
                (response)=>{
                    user.error = null;

                    if(response.data){
                        deferred.resolve();
                        $location.url('/chat');
                    }
                    else{
                        user.error = 'You need to login.';
                        deferred.reject();
                        $location.url('/');
                    }
                }
            );
            return deferred.promise;
        }
    };
}])

.factory("sio", function(){
    let socket:SocketIOClient.Socket;

    return {
        connect: function(){
            socket = io.connect('http://localhost:3000');
        },

        on: function(event:string, callback:Function){
            socket.on(event, callback);
        },

        emit: function(input:string){
            socket.emit('messages', {message: input});
        },

        close: function(){
            socket.close();
        }
    }
});
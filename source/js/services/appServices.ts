angular.module("chatApp")
.factory("RESTapi", ["$http", "$location", "$q", function($http, $location, $q){
    let error = null;
    let userId = null;
    let username = null;
    let userPicture = null;
    let userEmail = null;
    let socket:SocketIOClient.Socket = null;

    return {
        getError: function(){return error;},
        getUser: function(){return userId;},
        getUsername: function(){return username;},
        getUserPicture: function(){return userPicture;},
        getUserEmail: function(){return userEmail;},

        //USER LOGIN/SIGNUP
        checkLoggedIn: function(source = null){
            let deferred = $q.defer();

            $http.get('/loggedin').then(
                (response)=>{
                    error = null;

                    if(response.data !== '0'){
                        deferred.resolve();
                        // user = response.data['_id'];

                        if(source !== '/chat'){
                            $location.url('/chat');
                        }

                        this.ioEmit('login');
                    }
                    else{
                        // error = 'You need to login.';
                        deferred.resolve();
                        if(source !== '/'){
                            $location.url('/');
                        }
                    }
                }
            );
            return deferred.promise;
        },

        login: function(user){
            return $http.post('/login', user)
                .then((response) => {
                        userId = response.data['_id'];
                        username = response.data['username'];
                        userPicture = response.data['profilePicture'];
                        userEmail = response.data['email'];
                        this.ioEmit('join room', userId);
                        $location.url('/chat');
                        return response.data;
                    },
                    (reason)=>{
                        error = 'User/Password Incorrect.';
                        return error;
                    }
                );
        },

        signup: function(user){
            return $http.post('/signup', user)
                .then((response)=>{
                    if(response.data){
                        userId = response.data['_id'];
                        username = response.data['username'];
                        userPicture = response.data['profilePicture'];
                        userEmail = response.data['email'];
                        this.ioEmit('join room', userId);
                        $location.url('/chat');
                        return response.data;
                    }
                    else{
                        error = 'User already exists. Please log in.';
                        return error;
                    }
                });
        },

        logout: function(){
            $http.post('/logout', null)
            .then(()=>{
                error = null;
                userId = null;
                this.ioClose();
                $location.url('/');
            });
        },


        //USER API
        userData: function(config){
            return $http.get('/userData', config)
            .then(
                (response) => {
                    return { data: response.data };
                },
                (reject) => {}
            );
        },

        updateUserData: function(data){
            return $http.post('/updateUserData', data)
            .then(
                (response) => {
                    return response.data;
                },
                (reject) => {}
            )
        },

        insertUpdateContact: function(data){
            return $http.post('/insertUpdateContact', data)
            .then(
                (response) => {
                    return response.data;
                },
                (reject) => {}
            )
        },

        deleteContact: function(data){
            return $http.delete('/deleteUserContact', data)
            .then(
                (response) => {
                    return response.data;
                },
                (reject) => {}
            )
        },


        //SOCKET INTERFACE
        ioConnect: function(){
            socket = io.connect('http://localhost:3000');
        },

        ioOn: function(event:string, callback:Function){
            socket.on(event, callback);
        },

        //Send at most two parameters to the server: array of arguments and an aknowlegment function
        ioEmit: function(event:string, ...args:any[]){
            if(typeof args[args.length-1] === 'function'){
                socket.emit(event, args.slice(0, args.length-1), args[args.length-1]);
            }
            else{
                socket.emit(event, args);
            }
        },

        ioClose: function(){
            socket.close();
            socket = null;
        }
    }
}]);
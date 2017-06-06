angular.module("chatApp")
.factory("RESTapi", ["$http", "$location", "$q", function($http, $location, $q){

    let error = null;

    let socket:SocketIOClient.Socket = null;

    return {

        //USER LOGIN/SIGNUP
        checkLoggedIn: function(source = null){
            let deferred = $q.defer();

            $http.get('/loggedin').then(
                (response)=>{
                    this.error = null;

                    if(response.data !== '0'){
                        deferred.resolve();
                        this.ioEmit('join room', response.data._id);
                        this.ioEmit('logged in', response.data);

                        if(source !== '/chat'){
                            $location.url('/chat');
                        }
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
                        $location.url('/chat');
                        return response.data;
                    }
                    else{
                        error = 'User already exists. Please log in.';
                        // return error;
                    }
                });
        },

        logout: function(){
            $http.post('/logout', null)
            .then(()=>{
                error = null;
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

        updateUserProfileInContact: function(data){
            return $http.post('/updateUserProfileInContact', data)
            .then(
                (response) => {
                    return response.data;
                },
                (reject) => {}
            )
        },

        updateUserContactChat: function(data){
            return $http.post('/updateUserContactChat', data)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                )
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

        deleteChat: function(data){
            return $http.delete('/deleteUserChat', data)
            .then(
                (response) => {
                    return response.data;
                },
                (reject) => {}
            )
        },

        getUserContact: function(config){
            return $http.get('/getUserContact', config)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                );
        },

        insertUserChat: function(data){
            return $http.post('/insertUserChat', data)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                )
        },





        //CHAT ROOMS
        createChatRoom: function(users){
            return $http.post('/createChatRoom', users)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reason) => {}
                );
        },

        getChat: function(config){
            return $http.get('/getChat', config)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                );
        },

        deleteChatRoom: function(data){
            return $http.delete('/deleteChatRoom', data)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                )
        },

        updateChatRoom: function(data){
            return $http.post('/updateChatRoom', data)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                )
        },

        insertMessage: function(data){
            return $http.post('insertMessage', data)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reason) => {}
                )
        },

        getChatLength: function(config){
            return $http.get('/getChatLength', config)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                );
        },

        getChatMessages: function(config){
            return $http.get('/getChatMessages', config)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                );
        },

        getContactList: function(config){
            return $http.get('/getContactList', config)
                .then(
                    (response) => {
                        return response.data;
                    },
                    (reject) => {}
                );
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
            this.ioConnect();
        }
    }
}]);
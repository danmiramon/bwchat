angular.module("chatApp")
.factory("chatProfile", ["$q", "$http", "$location", function($q:angular.IQService,
                                  $http:angular.IHttpService,
                                  $location:angular.ILocationService){
    let user = {
        error: null,
        cookie: null
    };

    return {
        logged: function(){
            return user.cookie ? true : false;
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

            $http.get('loggedin').then(
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
}]);
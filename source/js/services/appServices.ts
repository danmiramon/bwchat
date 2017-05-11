angular.module("chatApp")
.factory("chatProfile", [function(){
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
        }
    };
}]);
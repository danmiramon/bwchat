angular.module("chatApp")
.factory("chatProfile", [function(){
    let user = {
        errors: null,
        cookie: null
    };

    return {
        logged: function(){
            return user.cookie ? true : false;
        },

        setUser: function(data){
            user.cookie = data;
        },

        getUser: function(){
            return user.cookie;
        },

        getUserData: function(field){
            return user.cookie[field];
        }
    };
}]);
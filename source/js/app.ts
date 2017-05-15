angular.module("chatApp", ["ngRoute"])
.config(["$routeProvider", function($routeProvider:angular.route.IRouteProvider){


    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            resolve: {
                logged: function(chatProfile, $location){
                    if(chatProfile.logged()){
                        $location.url('/chat');
                    }
                }
            }
        })
        .when('/chat', {
            templateUrl: 'views/chat.html',
            resolve: {
                logged: function(chatProfile, $location){
                        if(!chatProfile.logged()){
                            $location.url('/');
                    }
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        })
}]);
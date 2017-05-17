angular.module("chatApp", ["ngRoute", "ngMaterial"])
.config(["$routeProvider", function($routeProvider:angular.route.IRouteProvider){


    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            resolve: {
                logged: function(sio, $location){
                    if(sio.logged){
                        $location.url('/chat');
                    }
                }
            }
        })
        .when('/chat', {
            templateUrl: 'views/chat.html',
            resolve: {
                logged: function(sio, $location){
                    if(!sio.logged){
                            $location.url('/');
                    }
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        })
}]);
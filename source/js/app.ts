angular.module("chatApp", ["ngRoute", "ngMaterial"])
.config(["$routeProvider", function($routeProvider:angular.route.IRouteProvider){


    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            resolve: {
                logged: function(RESTapi) {
                    RESTapi.checkLoggedIn('/');
                }
            }
        })
        .when('/chat', {
            templateUrl: 'views/chat.html',
            resolve: {
                logged: function(RESTapi) {
                    RESTapi.checkLoggedIn('/chat');
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        })
}]);
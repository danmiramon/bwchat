angular.module("chatApp", ["ngRoute", "ngMaterial"])
.constant("EMAIL_RE", /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
.config(["$routeProvider",
    function($routeProvider:angular.route.IRouteProvider){

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
    });
}]);
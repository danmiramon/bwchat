angular.module("chatApp", ["ngRoute"])
.config(["$routeProvider", function($routeProvider:angular.route.IRouteProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html'
        })
        .when('/chat', {
            templateUrl: 'views/chat.html'
        })
        .otherwise({
            redirectTo: '/'
        })
}]);
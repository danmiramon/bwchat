angular.module("chatApp", ["ngRoute"])
.config(["$routeProvider", function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'mainCtrl'
        })
        .when('/chat', {
            templateUrl: 'views/chat.html',
            resolve: {
                loginCheck: checkLoggedin
            }
        })
        .otherwise({
            redirectTo: '/'
        })
}])
.controller("mainCtrl", ["$rootScope", "$scope", "$http", "$location", function($rootScope, $scope, $http, $location){
    $scope.signup = function(user){
        $http.post('/signup', user)
            .then((user)=>{
                $rootScope.currentUser = user;
                $location.url('/chat');
            });
    };

    $scope.login = function(user){
        $http.post('/login', user)
            .then((response) => {
                $rootScope.currentUser = response;
                $location.url('/chat');
            })
    };

    $scope.logout = function(){
        $http.post('/logout')
            .then(()=>{
                $rootScope.currentUser = null;
                $location.url('/');
            })
    }
}]);


function checkLoggedin($q, $timeout, $http, $location, $rootScope){
    let deferred = $q.defer();

    $http.get('loggedin').then(
        (user)=>{
            $rootScope.errorMessage = null;

            if(user !== '0'){
                $rootScope.currentUser = user;
                deferred.resolve();
            }
            else{
                $rootScope.errorMessage = 'You need to login.';
                deferred.reject();
                $location('/');
            }
        }
    );
    return deferred.promise;
}
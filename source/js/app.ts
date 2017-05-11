angular.module("chatApp", ["ngRoute"])
.config(["$routeProvider", function($routeProvider:angular.route.IRouteProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html'//,
            //controller: 'mainCtrl'
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
}]);



//Helper functions
function checkLoggedin(
    $q:angular.IQService,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    chatProfile){

    let deferred = $q.defer();

    $http.get('loggedin').then(
        (response)=>{
            chatProfile.setError(null);

            if(response.data){
                deferred.resolve();
            }
            else{
                chatProfile.setError('You need to login.');
                deferred.reject();
                $location.url('/');
            }
        }
    );
    return deferred.promise;
}
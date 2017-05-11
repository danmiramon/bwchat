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
    $rootScope:angular.IRootScopeService
    /*chatProfile*/){

    let deferred = $q.defer();

    $http.get('loggedin').then(
        (user)=>{
            //chatProfile.errors = null;
            $rootScope.errorMessage = null;

            if(user !== '0'){
                //chatProfile.cookie = user.data;
                $rootScope.currentUser = user;
                deferred.resolve();
            }
            else{
                //chatProfile.errors = 'You need to login.';
                $rootScope.errorMessage = 'You need to log in.';
                deferred.reject();
                $location.url('/');
            }
        }
    );
    return deferred.promise;
}
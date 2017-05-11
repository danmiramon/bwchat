angular.module('chatApp')
.controller("mainCtrl", ["$scope", "$http", "$location", "chatProfile", function(
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    chatProfile
){

    $scope.logged = false;

    //Sign in scope interface
    $scope.signup = function(user:any){
        $http.post('/signup', user)
        .then((response)=>{
            chatProfile.setCookie(response.data);
            chatProfile.checkLoggedin().then(
                (responseLogged) => {
                    $scope.email = chatProfile.getCookieData("email");
                    $scope.logged = chatProfile.logged();
                },
                (reason) => {
                    $scope.error = chatProfile.getError();
                }
            )
        });
    };

    $scope.login = function(user:any){
        $http.post('/login', user)
        .then((response) => {
            chatProfile.setCookie(response.data);
            chatProfile.checkLoggedin().then(
                (responseLogged) => {
                    $scope.email = chatProfile.getCookieData("email");
                    $scope.logged = chatProfile.logged();
                },
                (reason) => {
                    $scope.error = chatProfile.setError('User/Password Incorrect.').getError();
                }
            )
        },
        (reason)=>{
            $scope.error = chatProfile.setError('User/Password Incorrect.').getError();
        });
    };

    $scope.logout = function(){
        $http.post('/logout', null)
        .then(()=>{
            $scope.error = null;
            $scope.email = null;
            $scope.logged = false;
            chatProfile.setCookie(null);
            $location.url('/');
        });
    }
}]);
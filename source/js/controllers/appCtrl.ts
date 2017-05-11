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
                $scope.email = chatProfile.setCookie(response.data).getCookieData("email");
                //$scope.error = chatProfile.getError();
                $location.url('/chat');
            }, null).then((response)=> {
                console.log(chatProfile.getError());
                $scope.logged = chatProfile.logged();
            }, (reason)=>{
                    //console.log(chatProfile.getError());
                    console.log('correct catch');
            }
            );
    };

    $scope.login = function(user:any){
        $http.post('/login', user)
            .then((response) => {
                $scope.email = chatProfile.setCookie(response.data).getCookieData("email");
                //$scope.error = chatProfile.getError();
                $location.url('/chat');
            }).catch((reason)=>{
                $scope.error = chatProfile.setError('User/Password Incorrect.').getError();
                console.log($scope.error);
            }).then((response)=>{
                $scope.logged = chatProfile.logged();
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
            })
    }
}]);
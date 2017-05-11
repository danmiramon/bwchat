angular.module('chatApp')
.controller("mainCtrl", ["$rootScope", "$scope", "$http", "$location", "chatProfile", function(
    $rootScope:angular.IRootScopeService,
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    chatProfile
){
    //User profile scope interface
    // $scope.logged = function(){
    //     return chatProfile.logged();
    // };
    // $scope.profileEmail = function(){
    //     return chatProfile.logged() ?
    //         chatProfile.getUserData('email') : "";
    // };

    //Sign in scope interface
    $scope.signup = function(user:any){
        $http.post('/signup', user)
            .then((response)=>{
                //chatProfile.setUser(response.data);
                $rootScope.currentUser = response.data;
                $location.url('/chat');
            });
    };

    $scope.login = function(user:any){
        $http.post('/login', user)
            .then((response) => {
                //chatProfile.setUser(response.data);
                $rootScope.currentUser = response.data;
                $location.url('/chat');
            }, (reason)=>{
                $rootScope.errorMessage = 'User/Password Incorrect.';
            })
    };

    $scope.logout = function(){
        $http.post('/logout', null)
            .then(()=>{
                $rootScope.currentUser = null;
                $location.url('/');
                //chatProfile.setUser(null);
            })
    }
}]);
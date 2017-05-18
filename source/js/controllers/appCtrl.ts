angular.module('chatApp')
.controller("mainCtrl", ["$scope", "$http", "$location", "$q", "RESTapi"/*, "sio"*/, function(
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    $q:angular.IQService,
    RESTapi//,
    //sio
){
    //Connect to the socket
    RESTapi.ioConnect();

    //GLOBAL VARIABLES
    $scope.error = null;
    $scope.logged = null;


    //LOGIN - SIGNUP
    //Sign up
    $scope.signup = function(user:any){
        if(!user || !user.email){
            $scope.error = 'Enter a valid email.';
            return;
        }

        if(!user.password || !user.password2){
            $scope.error = 'Make sure to enter both passwords.';
            return;
        }

        if(user.password !== user.password2){
            $scope.error = 'Both passwords must be the same.';
            return;
        }

        user.username = user.email.slice(0, user.email.indexOf('@'));

        RESTapi.signup(user);
        $scope.error = RESTapi.getError();
    };

    //Log in
    $scope.login = function(user:any){
        RESTapi.login(user);
        $scope.error = RESTapi.getError();
    };

    //Logout
    $scope.logout = function(){
        RESTapi.logout();
        $scope.logged = null;
        $scope.error = null;
    };

    //Socket calls
        //On connection, initialize the user
    RESTapi.ioOn('logged', function(){
        $scope.logged = RESTapi.getUser();
    });



    //MENUS
    //Menu tabs configuration
    $scope.menus = [
        {
            tooltip: 'Profile',
            label: 'account_box',
            address: 'views/menu/profile.html'
        },
        {
            tooltip: 'Contacts',
            label: 'contacts',
            address: 'views/menu/contacts.html'
        },
        {
            tooltip: 'Chats',
            label: 'chat',
            address: 'views/menu/chats.html'
        }
    ];

    //Menu data loading
        //Get request config object
    let config = {
        params: null
    };
        //Helper functions
    let profileLoad = function(){
        config.params = {fields: 'firstname lastname username language profilePicture'};
        RESTapi.userData(config)
        .then(
            (response => {
                $scope.profile = response.data;
            })
        );
    };

    let contactsLoad = function(){
        console.log("I am in Contacts");
    };

    let chatsLoad = function(){
        console.log("I am in Chats");
    };

    $scope.dataLoad = function(menu){
        switch(menu){
            case 'Profile': {
                profileLoad();
                break;
            }
            case 'Contacts': {
                contactsLoad();
                break;
            }
            case 'Chats': {
                chatsLoad();
                break;
            }
        }
    };

    $scope.profileUpdate = function(){
        RESTapi.updateUserData($scope.profile)
        .then(
            (response) => {},
            (reason) => {
                console.log('Error ' + reason);
            }
        );
    };


    //Profile Pictures
    $scope.showPics = false;
    $scope.profileImages = ['img/profilePictures/bk.png',
        'img/profilePictures/bq.png',
        'img/profilePictures/bb.png',
        'img/profilePictures/bkn.png',
        'img/profilePictures/bt.png',
        'img/profilePictures/bp.png',
        'img/profilePictures/wk.png',
        'img/profilePictures/wq.png',
        'img/profilePictures/wb.png',
        'img/profilePictures/wkn.png',
        'img/profilePictures/wt.png',
        'img/profilePictures/wp.png'];

    $scope.selectPic = function(pic){
        $scope.profile.profilePicture = pic.img;
    };
    // $scope.profileChange = {
    //     language: 'en'
    // };
}]);
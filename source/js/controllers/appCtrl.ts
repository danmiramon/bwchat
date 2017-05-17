angular.module('chatApp')
.controller("mainCtrl", ["$scope", "$http", "$location", "$q", "sio", function(
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    $q:angular.IQService,
    sio
){
    //GLOBAL VARIABLES
    $scope.error = null;
    $scope.logged = null;
    // $scope.display = {
    //     user:"",
    //     picture:""
    // };

    //LOGIN - SIGNUP
    //Helper functions
    let checkLoggedin = function(userId){
        let deferred = $q.defer();

        $http.get('/loggedin').then(
            (response)=>{
                $scope.error = null;

                if(response.data){
                    deferred.resolve();
                    sio.connect(userId);
                    $scope.logged = sio.logged;
                    $location.url('/chat');
                }
                else{
                    deferred.reject();
                    $location.url('/');
                }
            }
        );
        return deferred.promise;
    };

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
        $http.post('/signup', user)
        .then((response)=>{
            checkLoggedin(response.data['_id']).then(
                (responseLogged) => {},
                (reason) => {
                    $scope.error = 'User already exists. Please log in.'
                }
            )
        });
    };

    $scope.login = function(user:any){
        $http.post('/login', user)
        .then((response) => {
                checkLoggedin(response.data['_id']).then(
                    (responseLogged) => {},
                    (reason) => {
                        $scope.error = 'User/Password Incorrect.';
                    }
                )
            },
            (reason)=>{
                $scope.error = 'User/Password Incorrect.';
            }
        );
    };

    //Logout
    $scope.logout = function(){
        $http.post('/logout', null)
            .then(()=>{
                $scope.error = null;
                sio.close();
                $scope.logged = sio.logged;
                $location.url('/');
            });
    };



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
        //Helper functions
    let profileLoad = function(){
        console.log("I am in Profile");
        sio.emit('getUserData', $scope.logged, 'firstname', 'lastname', 'username', 'language', function(data){
            console.dir(data);
        });
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
    // $scope.selectMenu = function(item){
    //     $scope.selectedMenu = item;
    // };

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
        $scope.user.profilePicture = pic.img;
    };
    $scope.profileChange = {
        language: 'en'
    };
    $scope.print = function(){
        console.dir($scope.user);
    }
}]);
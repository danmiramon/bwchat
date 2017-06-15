angular.module('chatApp')
.controller("mainCtrl", ["$scope", "$window", "$filter", "$http", "$location", "$q", "$timeout", "$mdToast", "EMAIL_RE", "RESTapi", function(
    $scope:app.IChatScope,
    $window:angular.IWindowService,
    $filter:angular.IFilterService,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    $q:angular.IQService,
    $timeout:angular.ITimeoutService,
    $mdToast:angular.material.IToastService,
    EMAIL_RE,
    RESTapi
){

    //GLOBAL VARIABLES
    $scope.error = null;
    $scope.profile = {
        profilePicture: null,
        firstname: null,
        lastname: null,
        username: null,
        language: null
    };

    //Connect to the socket
    RESTapi.ioConnect();
    RESTapi.ioOn('get login data', function(data){
        $scope.user = data;
        $timeout(function(){
            $scope.profile.profilePicture = $scope.user.profilePicture;
            $scope.profile.firstname = $scope.user.firstname;
            $scope.profile.lastname = $scope.user.lastname;
            $scope.profile.username = $scope.user.username;
            $scope.profile.language = $scope.user.language;
        }, 0);
    });

    //Log in
    $scope.keyPressLogin = function(event:KeyboardEvent,user:app.IAppUser):void{
        if(event.keyCode === 13){
            $scope.login(user, true);
        }
    };
    $scope.login = function(user:app.IAppUser, errorFlag:boolean):void{
        RESTapi.login(user)
        .then(
            (response) => {
                if(typeof response === 'string' && errorFlag){
                    $scope.error = response;
                }
                else{
                    $scope.user = response;
                }
            },
            (reason) => {
            }
        );
    };

    //Sign up
    $scope.keyPressSignup = function(event:KeyboardEvent,user:app.IAppUser):void{
        if(event.keyCode === 13){
            $scope.signup(user);
        }
    };
    $scope.signup = function(user:app.IAppUser):void{
        if(!user || !user.email){
            $scope.error = 'Enter a valid email.';
            return;
        }

        if(!EMAIL_RE.test(user.email)){
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

        RESTapi.signup(user)
        .then((response) => {
            if(typeof response === 'string'){
                $scope.error = response;
            }
            else{
                $scope.user = response;
            }
        },
            (reason) => {

        });
    };

    //Logout
    $scope.logout = function():void{
        RESTapi.ioEmit('clear chat view', $scope.user._id);
        RESTapi.logout()
        .then(
            (response) => {
                $scope.user = null;
                $scope.error = null;
            },
            (reason) => {}
        )
    };
    $scope.showLogoutToast = function():void{
        $mdToast.show({
            position: 'top right',
            template: '<md-toast class="mdCursor" layout="row" layout-align="center center" ng-click="logout()">' +
                            '<span>' +
                                '<md-icon class="md-material redIcons">power_settings_new</md-icon>' +
                                '</span><span translate>LOGOUT</span>' +
                            '</span>' +
                      '</md-toast>',
            hideDelay: 1500,
            parent: document.getElementById('toastLogout'),
            preserveScope:true,
            scope: $scope,
        });
    };

    //On window/browser exit do the user's logout
    $scope.onExit = function():void{
        RESTapi.ioEmit('clear chat view', $scope.user._id);
    };
    $window.onbeforeunload = $scope.onExit;
}])

.controller("menuCtrl", ["$scope", "$filter", "$http", "$timeout", "$window", "orderByFilter", "$location", "$q", "$mdDialog", "$mdMenu", "$translate", "moment", "RESTapi", function(
    $scope:app.IChatScope,
    $filter:angular.IFilterService,
    $http:angular.IHttpService,
    $timeout:angular.ITimeoutService,
    $window:angular.IWindowService,
    orderBy:angular.IFilterOrderBy,
    $location:angular.ILocationService,
    $q:angular.IQService,
    $mdDialog:any,
    $mdMenu:angular.material.IMenuService,
    $translate:angular.translate.ITranslateService,
    moment,
    RESTapi
){
    RESTapi.ioOn('clear chat area data', function(){
        RESTapi.ioEmit('remove from chat view', $scope.currentChat._id, $scope.user._id);
        $scope.currentChat = null;
        $scope.infiniteItems.clearChat();
        $timeout(function(){
            $scope.chatView = {
                chatname: null,
                chatPicture: null,
                chatContactList: [],
                contactList: []
            };
        },0);
    });

    //MENUS
    //Menu tabs configuration
    $scope.menus = [
        {
            tooltip: 'MENU_PROFILE',
            label: 'account_box',
            address: 'views/menu/profile.html'
        },
        {
            tooltip: 'MENU_CONTACTS',
            label: 'people',
            address: 'views/menu/contacts.html'
        },
        {
            tooltip: 'MENU_CHATS',
            label: 'chat',
            address: 'views/menu/chats.html'
        }
    ];

    $scope.dataLoad = function(menu:string):void{
        elementsSelected = [];
        $scope.remove = false;
        $timeout(function(){
            if(menu === 'account_box'){
                $scope.selectedPicture = $scope.profile.profilePicture;
            }
        },0);
    };


    //CONTACTS & CHATS
    //Checkbox control functions
    $scope.remove = false;
    let elementsSelected:number[] = []; //Selected items
    //Toggles the checkbox value
    $scope.toggle = function(index:number):void{
        let i:number = elementsSelected.indexOf(index);
        if(i > -1){
            elementsSelected.splice(i, 1);
        }
        else{
            elementsSelected.push(index);
        }
    };

    //Checks that the element (contact/chat) exists in the selected items array
    $scope.exists = function(index:number):boolean{
        return elementsSelected.indexOf(index) > -1;
    };

    //Toogles the multi remove button
    $scope.removeToggle = function(collection:string, event:MouseEvent, value:boolean):void{
        $scope.remove = value;
        if(elementsSelected.length > 0){
            switch(collection){
                case 'contacts':{
                    $scope.removeContact(event, null);
                    break;
                }
                case 'chats':{
                    $scope.removeChat(event, null);
                    break
                }
            }
        }
    };

    //Sorting elements. Receives a collection name, a field and a reverse sort boolean
    $scope.sortBy = function(collection:string, field:string, reverse:boolean):void{
        elementsSelected = [];
        $scope.user[collection] = orderBy($scope.user[collection], field, reverse);
        $scope.remove = false;
    };



        //PROFILE
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

    $scope.selectedPicture = $scope.profileImages[0];
    $scope.selectPic = function(index:number):void{
        $scope.selectedPicture = index;
        $scope.profile.profilePicture = $scope.profileImages[index];
    };

    $scope.profileUpdate = function():void{
        //If there are changes in the picture or username, update all the contacts and personal chat data
        if($scope.profile.profilePicture !== $scope.user.profilePicture ||
            $scope.profile.username !== $scope.user.username ||
            $scope.profile.language !== $scope.user.language
        ){
            //Change language at runtime
            if($scope.profile.language !== $scope.user.language){
                $translate.use($scope.profile.language);
                moment.locale($scope.profile.language);
            }

            //Update user view data and database fields
            $scope.user.firstname = $scope.profile.firstname;
            $scope.user.lastname = $scope.profile.lastname;
            $scope.user.username = $scope.profile.username;
            $scope.user.language = $scope.profile.language;
            $scope.user.profilePicture = $scope.profile.profilePicture;
            RESTapi.updateUserData($scope.profile)
            .then(
                (response) => {
                    for(let contact of $scope.user.contacts){
                        //Emit a messaga to the contacts to update their views
                        RESTapi.ioEmit('contact profile update',
                            contact.contactId,
                            $scope.user._id,
                            $scope.user.profilePicture,
                            $scope.user.username);

                        //Emit a message to the contacts to update their views
                        RESTapi.getChat({params:{
                            id: null,
                            contacts: [contact.contactId, $scope.user._id],
                            privateChat: true
                        }})
                        .then(
                            (response) => {
                                if(response){
                                    for(let contact of response.contacts){
                                        if(contact !== $scope.user._id){
                                            RESTapi.ioEmit('contact chat update',
                                                contact,
                                                response._id,
                                                $scope.user.profilePicture);
                                        }
                                    }
                                }
                            },
                            (reason) => {}
                        )
                    }
                },
                (reason) => {
                    console.log('Error ' + reason);
                }
            );
        }
    };

    //Uodate the view from a profile change in a contact
    RESTapi.ioOn('update contact profile', function(data){
        $timeout(function(){
            let index:number = $scope.user.contacts.findIndex(item => item.contactId === data[0]);
            $scope.user.contacts[index].profilePicture = data[1];
            $scope.user.contacts[index].username = data[2];
        }, 0);
    });
    RESTapi.ioOn('update contact chat', function(data){
        $timeout(function(){
            let index:number = $scope.user.chats.findIndex(item => item.chatId === data[0]);
            $scope.user.chats[index].chatPicture = data[1];
        }, 0);
    });



        //CONTACTS
    $scope.addContact = function(event:MouseEvent):void{
        $mdDialog.show({
            controller: 'ContactDialogController',
            templateUrl: '../views/dialog/addUser.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                user: $scope.user
            }
        })
            .then(
                (response) => {

                },
                (reason) => {

                }
            )
    };
    //Added contacts must be reflected in the view
    RESTapi.ioOn('contacts added', function(data){
        $timeout(function(){
            for(let i:number = 1; i < data.length; i++){
                $scope.user.contacts.push({
                    contactId: data[i]._id,
                    username: data[i].username,
                    viewname: data[i].username,
                    profilePicture: data[i].profilePicture,
                    status: data[0]
                });
            }
        },0);
    });

    $scope.goToChat = function(event:MouseEvent, index:number, status:number):void{
        if(status < 300){
            //User have not been accepted yet by the contact
            if(status === 100){
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(true)
                        .title('Contact Alert')
                        .textContent($scope.user.contacts[index].viewname + ' has not accepted your Contact Request yet')
                        .ariaLabel($scope.user.contacts[index].viewname + ' has not accepted your Contact Request yet')
                        .ok('Close')
                        .targetEvent(event)
                );
            }
            //The user have not accepted the contact request yet
            if(status === 200){
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(true)
                        .title('Contact Alert')
                        .textContent('Accept ' + $scope.user.contacts[index].viewname + '\'s Contact Request to chat')
                        .ariaLabel('Accept ' + $scope.user.contacts[index].viewname + '\'s Contact Request to chat')
                        .ok('Close')
                        .targetEvent(event)
                );
            }
            return;
        }

        //If status >= 300, create/open chat room
        RESTapi.createChatRoom([$scope.user.contacts[index].contactId, $scope.user._id])
            .then(
                (response) => {
                    //New Chat room is created, add the room information to each user
                    if(response){
                        //Set the new chat room as the current room
                        if($scope.currentChat && $scope.currentChat._id !== response._id){
                            RESTapi.ioEmit('remove from chat view', $scope.currentChat._id, $scope.user._id);
                            RESTapi.ioEmit('leave room', $scope.currentChat._id);
                        }
                        $scope.currentChat = response;

                        //Insert the chat information to each user
                        //One to one chat
                        //Sets each others avatar and view name in the chat list
                        //Get the contact, then write on the others profile
                        for(let i:number = 0, j = 1; i < 2; i++, j--){
                            RESTapi.getUserContact({
                                params: {
                                    contactFrom: $scope.currentChat.contacts[i],
                                    contactTo: $scope.currentChat.contacts[j]
                                }
                            })
                                .then(
                                    (response) => {
                                        let insertChat:{id:string, chat:app.IAppUserChat} = {
                                            id: response._id,
                                            chat: {
                                                chatId: $scope.currentChat._id,
                                                chatname: response.contacts[0].viewname,
                                                chatPicture: response.contacts[0].profilePicture
                                            }
                                        };
                                        addChatToUsers(insertChat);
                                    }
                                )
                        }
                    }
                    //The room already exists
                    else{
                        $scope.loadChat([$scope.user.contacts[index].contactId, $scope.user._id], null, true);
                    }
                },
                (reason) => {}
            );

        //Move to chat menu
        $scope.selectedTab = 2;
    };

    $scope.editViewName = function(event:MouseEvent, index:number, status:number):void{
        if(status < 300){
            //Cannot modify unaccepted contacts viewname
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title($filter('translate')('CONTACT_ALERT'))
                .textContent($filter('translate')('VIEWNAME_CHANGE_FALSE'))
                .ariaLabel('Cannot modify the username of unaccepted contacts')
                .ok($filter('translate')('CLOSE'))
                .targetEvent(event)
            );
        }
        else{
            //Edit the contact's viewname
            let confirm:any = $mdDialog.prompt()
                .title($filter('translate')('VIEWNAME_CHANGE_TRUE_1') + $scope.user.contacts[index].viewname + $filter('translate')('VIEWNAME_CHANGE_TRUE_2'))
                .placeholder($filter('translate')('CONTACT_NAME'))
                .ariaLabel('Contact Name')
                .initialValue($scope.user.contacts[index].viewname)
                .targetEvent(event)
                .ok($filter('translate')('CHANGE_NAME'))
                .cancel($filter('translate')('CANCEL'));

            $mdDialog.show(confirm)
            .then(
                function(response){
                    //Show an alert if the viewname is empty
                    if(response === ""){
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(true)
                            .title($filter('translate')('CONTACT_ALERT'))
                            .textContent($filter('translate')('NAME_EMPTY'))
                            .ariaLabel('Contacts must have a name')
                            .ok($filter('translate')('CLOSE'))
                            .targetEvent(event)
                        );
                    }
                    //Modify the contact's username
                    else{
                        //Update contact viewname in the database
                        $scope.user.contacts[index].viewname = response;
                        RESTapi.insertUpdateContact({
                            id: $scope.user._id,
                            contact: $scope.user.contacts[index]
                        })
                        .then(
                            (response) => {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                    .parent(angular.element(document.body))
                                    .clickOutsideToClose(true)
                                    .title($filter('translate')('NAME_CHANGED'))
                                    .textContent($filter('translate')('NAME_CHANGED_1') + $scope.user.contacts[index].viewname + $filter('translate')('NAME_CHANGED_2') + $scope.user.contacts[index].viewname)
                                    .ariaLabel('Your view name for ' + $scope.user.contacts[index].viewname + ' is now ' + $scope.user.contacts[index].viewname)
                                    .ok($filter('translate')('CLOSE'))
                                    .targetEvent(event)
                                );

                                //Update the viewname in the chats view
                                RESTapi.getChat({params:{
                                    id: null,
                                    contacts: [$scope.user.contacts[index].contactId, $scope.user._id],
                                    privateChat: true
                                }})
                                .then(
                                    (response) => {
                                        if(response){
                                            let index2:number = $scope.user.chats.findIndex(item => item.chatId === response._id);
                                            $scope.user.chats[index2].chatname = $scope.user.contacts[index].viewname;
                                            RESTapi.updateUserContactChat({
                                                chatId: response._id,
                                                chatname: $scope.user.chats[index2].chatname
                                            });

                                        }
                                    },
                                    (reason) => {}
                                )
                            },
                            (reason) => {}
                        )
                    }
                },
                function(reason){}
            )
        }
    };

    $scope.acceptContactRequest = function(index:number):void{
        //Update contact in the user database
        $scope.user.contacts[index].status = 300; //Request accepted
        RESTapi.insertUpdateContact({
            id: $scope.user._id,
            contact: $scope.user.contacts[index]
        })
            .then(
                (response) => {},
                (reason) => {}
            );

        //Update user data in the contact database
        RESTapi.insertUpdateContact({
            id: $scope.user.contacts[index].contactId,
            contact: {
                contactId: $scope.user._id,
                username: $scope.user.username,
                viewname: $scope.user.username,
                profilePicture: $scope.user.profilePicture,
                status: 300
            }
        })
            .then(
                (response) => {
                    RESTapi.ioEmit('accept request', $scope.user.contacts[index].contactId, $scope.user._id);
                },
                (reason) => {}
            )
    };

    RESTapi.ioOn('request accepted', function(contact){
        let index:number = $scope.user.contacts.findIndex(item => item.contactId === contact);
        $timeout(function(){
            $scope.user.contacts[index].status = 300;
        }, 0);
    });

    //Contact remove function
    $scope.removeContact = function(event:MouseEvent, index:number):void{
        let confirm:any = $mdDialog.confirm()
            .title($filter('translate')('ALERT_REMOVE_CONTACT'))
            .textContent($filter('translate')('REMOVE_CONTACT_TEXT'))
            .ariaLabel('Remove contact(s)?')
            .targetEvent(event)
            .ok($filter('translate')('REMOVE'))
            .cancel($filter('translate')('CANCEL'));

        $mdDialog.show(confirm)
        .then(
            (response) => {
                //List of contacts to be effectively removed
                let removeList:string[] = [];
                let counter:number = 0;
                //If we get an index is because the trash can or reject button were pressed
                if(index !== null){
                    removeList.push($scope.user.contacts[index].contactId);
                    removePrivateChatRoom(removeList[counter], $scope.user._id);
                    updateOnDelete(removeList[counter]);
                    $scope.user.contacts.splice(index,1);
                    counter++;
                }
                //Otherwise, a list of contacts must exist
                else{
                    //Sort the selected elements and remove them from greatest number to lower number to avoid index replacement
                    elementsSelected.sort();
                    for(let i = elementsSelected.length - 1; i >=0; i--){
                        removeList.push($scope.user.contacts[elementsSelected[i]].contactId);
                        removePrivateChatRoom(removeList[counter], $scope.user._id);
                        updateOnDelete(removeList[counter]);
                        $scope.user.contacts.splice(elementsSelected[i],1);
                        counter++;
                    }
                }
                elementsSelected = [];
                //If the remove list have elements, delete them from the database
                if(removeList.length > 0){
                    RESTapi.deleteContact({
                        params: {
                            userId: $scope.user._id,
                            contacts: removeList
                        }
                    })
                        .then(
                            (response) => {},
                            (reason) => {}
                        )
                }
            },
            (reason) => {}
        );
    };

    //Remove element from the user view
    let updateOnDelete:(contact:string)=>void = function(contact:string):void{
        //Remove this user data from the contact database
        RESTapi.deleteContact({
            params: {
                userId: contact,
                contacts: [$scope.user._id]
            }
        })
            .then(
                (response) => {
                    RESTapi.ioEmit('contact deleted', contact, $scope.user._id); //Tell the contact to "status = 0" this user
                },
                (reason) => {}
            );
    };

    RESTapi.ioOn('remove contact', function(contact){
        let index:number = $scope.user.contacts.findIndex(item => item.contactId === contact);
        if(index >= 0){
            $timeout(function(){
                $scope.user.contacts.splice(index,1);
                elementsSelected = [];
            }, 0);
        }
    });

    let removePrivateChatRoom:(contactId:string, userId:string)=>void = function(contactId:string, userId:string):void{
        //Look for a private chat room
        RESTapi.getChat({
            params: {
                id: null,
                contacts: [contactId, userId],
                privateChat: true
            }
        })
        .then(
            (response) => {
                if(response){
                    let index:number = $scope.user.chats.findIndex(item => item.chatId === response._id);
                    if(index >= 0)
                    {
                        $timeout(function(){
                            if($scope.currentChat && $scope.currentChat._id === response._id){
                                RESTapi.ioEmit('remove from chat view', $scope.currentChat._id, $scope.user._id);
                                RESTapi.ioEmit('leave room', $scope.currentChat._id);
                                $scope.currentChat = null;
                            }
                            //Inform the contact to remove the chat from its chat list
                            RESTapi.ioEmit('chat deleted', contactId, response._id);
                            $scope.user.chats.splice(index,1);
                            elementsSelected = [];
                        },0);

                        //Delete the chat room from the data base
                        //User first
                        RESTapi.deleteChat({
                            params: {
                                userId: userId,
                                chats: [response._id]
                            }
                        })
                            .then(
                                (response) => {},
                                (reason) => {}
                            );
                        //Contact later
                        RESTapi.deleteChat({
                            params: {
                                userId: contactId,
                                chats: [response._id]
                            }
                        })
                            .then(
                                (response) => {},
                                (reason) => {}
                            );
                    }
                }
            },
            reason => {}
        )
    };

    RESTapi.ioOn('remove chat', function(chat){
        let index:number = $scope.user.chats.findIndex(item => item.chatId === chat);
        if(index >= 0){
            $timeout(function(){
                if($scope.currentChat && $scope.currentChat._id === chat){
                    RESTapi.ioEmit('remove from chat view', $scope.currentChat._id, $scope.user._id);
                    RESTapi.ioEmit('clear chat view', $scope.user._id);
                    RESTapi.ioEmit('leave room', $scope.currentChat._id);
                }
                $scope.user.chats.splice(index,1);
                elementsSelected = [];
            }, 0);
        }
    });





        //CHATS MENU
    $scope.currentChat = null;
    let setCurrentChat:(currChat:app.IAppChat)=>void = function(currChat:app.IAppChat):void{
        if($scope.currentChat && $scope.currentChat._id !== currChat._id){
            RESTapi.ioEmit('remove from chat view', $scope.currentChat._id, $scope.user._id);
            RESTapi.ioEmit('leave room', $scope.currentChat._id);
        }
        $scope.currentChat = currChat;
    };

    $scope.loadChat = function(participants:string[], id:string, privateChat:boolean):void{
        //Access the intended chat
        RESTapi.getChat({
            params: {
                id: id,
                contacts: participants,
                privateChat: privateChat
            }
        })
            .then(
                (response) => {
                    //Set the found chat room as the current room
                    if($scope.currentChat && $scope.currentChat._id !== response._id){
                        RESTapi.ioEmit('remove from chat view', $scope.currentChat._id, $scope.user._id);
                        RESTapi.ioEmit('leave room', $scope.currentChat._id);
                    }
                    $scope.currentChat = response;
                    let index:number = $scope.user.chats.findIndex(item => item.chatId === response._id);
                    if(index >= 0){
                        RESTapi.ioEmit('join chat room', response._id, $scope.user._id, function(){
                            openChat();
                        });
                    }
                    else{
                        //If the chat is private and the users have been readded after a deletion, the chat information
                        //must be re-added as well on the first attempt of contact
                        //Add to the contact
                        addToOneOnOneChat(participants, response._id);
                    }
                },
                (reason) => {}
            );
    };

    RESTapi.ioOn('open chat', function(){
        openChat();
    });

    //Add chat
    $scope.addChat = function(event:MouseEvent):void{
        $mdDialog.show({
            controller: 'ChatDialogController',
            templateUrl: '../views/dialog/addChat.html',
            parent: angular.element(document.body),
            multiple: true,
            targetEvent: event,
            locals: {
                currentChat: $scope.currentChat,
                addToOneOnOneChat: addToOneOnOneChat,
                addChatToUsers: addChatToUsers,
                setCurrentChat: setCurrentChat,
                loadChat: $scope.loadChat,
                user: $scope.user
            }
        })
            .then(
                (response) => {

                },
                (reason) => {

                }
            )
    };

    let addToOneOnOneChat:(contacts:string[], chatId:string)=>void = function(contacts:string[], chatId:string):void{
        for(let i:number = 0, j:number = 1; i < 2; i++, j--){
            RESTapi.getUserContact({
                params: {
                    contactFrom: contacts[i],
                    contactTo: contacts[j]
                }
            })
                .then(
                    (response) => {
                        addChatToUsers({
                            id: response._id,
                            chat: {
                                chatId: chatId,
                                chatname: response.contacts[0].viewname,
                                chatPicture: response.contacts[0].profilePicture
                            }
                        });
                    }
                )
        }
    };

    let addChatToUsers:(charData:{id:string, chat:app.IAppUserChat})=>void = function(chatData:{id:string, chat:app.IAppUserChat}):void{
        RESTapi.insertUserChat(chatData)
            .then(
                (response) => { //Response contains the chat information and each user contactId
                    if(response.id === $scope.user._id){
                        //Join the newly created chat
                        $scope.user.chats.push(response.chat);
                        $scope.loadChat(null, response.chat.chatId, true);
                    }
                    else{
                        //Launch a message to all the users to update the view
                        RESTapi.ioEmit('chat room added', response);
                    }
                },
                (reason) => {}
            );
    };

    RESTapi.ioOn('added new chat room', function(data){
        $timeout(function(){
            $scope.user.chats.push(data);
        }, 0);
    });

    //Remove chat
    //Contact remove function
    $scope.removeChat = function(event:MouseEvent, index:number):void{
        let confirm:any = $mdDialog.confirm()
            .title($filter('translate')('ALERT_REMOVE_CHAT'))
            .textContent($filter('translate')('REMOVE_CHAT_TEXT'))
            .ariaLabel('Remove chat room(s)?')
            .targetEvent(event)
            .ok($filter('translate')('REMOVE'))
            .cancel($filter('translate')('CANCEL'));

        $mdDialog.show(confirm)
            .then(
                (response) => {
                    //List of chats to be effectively removed
                    let removeList:(string|number)[] = [];
                    //If we get an index is because the trash can button were pressed
                    if(index !== null){
                        removeList.push($scope.user.chats[index].chatId);

                    }
                    //Otherwise, a list of chats must exist
                    else{
                        for(let i of elementsSelected){
                            removeList.push($scope.user.chats[i].chatId);
                        }
                        elementsSelected = []; //Clear the "checkbox" array
                    }

                    //If the remove list have elements process them accordingly if they are one-to-one or group rooms
                    for(let chatRoom of removeList){
                        removeUserFromChatRoom(chatRoom, $scope.user._id);
                    }
                },
                (reason) => {}
            );
    };

    let removeUserFromChatRoom:(chatRoom:string|number, userId:string)=>void = function(chatRoom:string|number, userId:string):void{
        //Get the chat room information
        RESTapi.getChat({
            params: {
                id: chatRoom,
                contacts: null,
                privateChat: false
            }
        })
            .then(
                (response) => {
                    //Treat group rooms
                    if(response.groupRoom){
                        //Remove the contact from the chat room
                        removeContactFromChatRoom(response, userId);

                        //Remove just for this user
                        removeChatRoom(response._id, userId);
                    }
                    //Treat One-To-One rooms
                    else{
                        for(let i:number = 0; i < 2; i++){
                            //Remove from both ends
                            removeChatRoom(response._id, response.contacts[i]);
                        }
                    }
                },
                (reason) => {}
            )
    };

    let removeChatRoom:(chatId:string, userId:string)=>void = function(chatId:string, userId:string):void{
        //Remove the chat from the view
        RESTapi.ioEmit('chat deleted', userId, chatId);

        //Remove the chat from the user database
        RESTapi.deleteChat({
            params: {
                userId: userId,
                chats: [chatId]
            }
        })
            .then(
                (response) => {},
                (reason) => {}
            );
    };

    let removeContactFromChatRoom:(chatRoom:app.IAppChat, userId:string)=>void = function(chatRoom:app.IAppChat, userId:string):void{
        //Check if the user is the last one to leave the chat room
        if(chatRoom.contacts.length === 1){
            RESTapi.deleteChatRoom({
                params: {
                    id: chatRoom._id
                }
            })
                .then(
                    (response) => {},
                    (reason) => {}
                )
        }
        //If more users remain, just update the chat room without the user
        else{
            //Remove the user from the chat room participants
            let index:number = chatRoom.contacts.findIndex(item => item === userId);
            chatRoom.contacts.splice(index, 1);

            //Update the chat room
            RESTapi.updateChatRoom({
                id: chatRoom._id,
                data: chatRoom
            })
                .then(
                    (response) => {},
                    (reason) => {}
                )
        }

        //Emit an alert to all users to remove this one from their current chats
        RESTapi.ioEmit('remove from current chat', chatRoom._id, userId);
    };
    RESTapi.ioOn('remove user from current chat', function(data){
        //Remove contact information from current chat
        if($scope.user._id !== data){
            $timeout(function(){
                let index:number = $scope.currentChat.contacts.findIndex(item => item === data);
                $scope.currentChat.contacts.splice(index,1);
                index = $scope.chatView.chatContactList.findIndex(item => item.userId === data);
                $scope.chatView.chatContactList.splice(index,1);
                index = $scope.chatView.contactList.findIndex(item => item.userId === data);
                if(index >= 0){
                    $scope.chatView.contactList.splice(index,1);
                }
            },0);
        }
    });






        //CHAT ROOM WINDOW MANAGEMENT
    //Infinite scroll class
    //Infinite scroll class list class
    class InfiniteScrollItems{
        //Variables
        private loadedPages:object;
        private numItems:number;
        private PAGE_SIZE:number;
        private lastPage:number;
        private scroll;
        private contacts:object[];

        //RESTapi functions
        private getChatLength:Function;
        private getChatMessages:Function;
        private getAllContacts:Function;

        constructor(getChatLength: Function, getChatMessages: Function, getAllContacts: Function){
            this.loadedPages = {};
            this.numItems = 0;
            this.PAGE_SIZE = 50;
            this.lastPage = 0;
            this.contacts = [];

            this.scroll = document.getElementsByClassName('md-virtual-repeat-scroller')[0];

            this.getChatLength = getChatLength;
            this.getChatMessages = getChatMessages;
            this.getAllContacts = getAllContacts;

            this.fetchNumItems();
        }

        public getItemAtIndex: (index:number) => Object = function(index:number):Object{
            if($scope.currentChat  && this.contacts.length > 0){
                let pageNumber:number = Math.floor(index / this.PAGE_SIZE);
                let page:Object = this.loadedPages[pageNumber];

                if(page){
                    return page[index % this.PAGE_SIZE];
                }
                else if(page !== null){
                    this.fetchPage(pageNumber);
                }
            }
        };

        public getLength: () => number = function(): number{
            return this.numItems;
        };

        public insertNewMessage: (msg:Object) => void = function(msg:Object):void{
            let page:number = Math.floor(this.numItems / this.PAGE_SIZE);
            if(!this.loadedPages[page]){
                this.loadedPages[page] = [];
            }
            $timeout(function(ii, page, msg){
                ii.loadedPages[page].push(msg);
                ii.numItems++;
                $timeout(function(iii){
                    iii.scroll.scrollTop = iii.scroll.scrollHeight;
                }, 0, true, ii);
            }, 0, true, this, page, msg);
        };
        public clearChat: () => void = function():void{
            this.loadedPages = {};
        };

        private fetchPage: (pageNumber:number) => void = function(pageNumber:number):void{
            this.loadedPages[pageNumber] = null;
            this.getChatMessages({params:{id:$scope.currentChat._id,
                                     pageNumber: pageNumber,
                                     pageSize: this.PAGE_SIZE}})
            .then(
                (response) => {
                    this.loadedPages[pageNumber] = [];
                    for(let msg of response){
                        let messageUnit:app.IMessageUnit = {
                            user: msg.user,
                            username: null,
                            profilePicture: null,
                            text: msg.text,
                            image: msg.image,
                            date: msg.date
                        };
                        //Get the user'a username and profile picture from the chat's contact list
                        let index:number = $scope.chatView.chatContactList.findIndex(item => item.userId === msg.user);
                        if(index >= 0){
                            messageUnit.username = $scope.chatView.chatContactList[index].username;
                            messageUnit.profilePicture = $scope.chatView.chatContactList[index].profilePicture;
                        }
                        else{
                            index = this.contacts.findIndex(item => item.userId === msg.user);
                            messageUnit.username = this.contacts[index].username;
                            messageUnit.profilePicture = this.contacts[index].profilePicture;
                        }
                        this.loadedPages[pageNumber].push(messageUnit);
                    }
                    $timeout(function(i){
                        i.scroll.scrollTop = i.scroll.scrollHeight;
                    }, 0, true, this);
                },
                (reason) => {}
            );

        };

        //Executed at the object creation
        private fetchNumItems: ()=>void = function():void{
            this.getChatLength({params:{id:$scope.currentChat._id}})
            .then(
                (response) => {
                    this.numItems = response;
                    $scope.startIndex = response-1;

                    //Retrieve the contacts
                    this.getAllContacts()
                        .then(
                            (response) => {
                                this.contacts = response;
                            },
                            (response) => {}
                        );
                },
                (reason) => {}
            );
        };
    }

    let shiftNotPressed:boolean = true; //Shift key pressed status, for multiline messages
    //Get the Virtual Repeat Container Controller to execute the scrollTo method

    //Canvas initialization and methods
    let canvas:HTMLCanvasElement = null;
    let canvasContext:CanvasRenderingContext2D = null;
    //Open/Close
    $scope.canvasFlag = false;
    $scope.openCanvas = function():void{
        $scope.canvasFlag = !$scope.canvasFlag;
        canvas = <HTMLCanvasElement>document.getElementById('canvasMessage');
        canvasContext = canvas.getContext('2d');
        canvasContext.fillStyle = 'white';
        canvasContext.fillRect(0,0,canvas.width,canvas.height);
        canvasContext.fillStyle = "#000000";

    };
    let drawing:boolean = false;
    $scope.startDraw = function(event:MouseEvent):void{
        drawing = true;
        $scope.draw(event);
    };
    $scope.draw = function(event:MouseEvent):void{
        if(drawing){
            let canvasRect:ClientRect = canvas.getBoundingClientRect();
            let x:number = event.clientX - canvasRect.left;
            let y:number = event.clientY - canvasRect.top;
            canvasContext.fillRect(x,y,2,2);
        }
    };
    $scope.stopDraw = function(event:MouseEvent):void{
        drawing = false;
    };
    $scope.setColor = function(color:string):void{
        canvasContext.fillStyle = color;
    };

    //CHAT ENTER POINT
    //Open and populate the chat view
    let openChat:()=>void = function():void{
        //Cleat the chat view on chat changing
        $scope.chatView = {
            chatname: null,
            chatPicture: null,
            chatContactList: [], //Contact list from the chat, used to get info for the messages
            contactList: [] //List of currently connected contacts in the chat room, used in the toolbar area
        };

        //Get the chat position in the user's chat list
        let chatIndex:number = $scope.user.chats.findIndex(item => item.chatId === $scope.currentChat._id);

        //Set the chatname
        $scope.chatView.chatname = $scope.user.chats[chatIndex].chatname;
        $scope.chatView.chatPicture = $scope.user.chats[chatIndex].chatPicture;

        //Get the chat's current contact list
        RESTapi.getContactList({params: { contacts: $scope.currentChat.contacts}})
        .then(
            (response) => {
                for(let i:number = 0 ; i < response.length; i++){
                    let index:number = $scope.user.contacts.findIndex(item => item.contactId === response[i].userId);
                    if(index >= 0){
                        response[i].username = $scope.user.contacts[index].viewname;
                    }
                }
                $scope.chatView.chatContactList = response;

                //Send user information to all contacts connected
                RESTapi.ioEmit('who is connected', $scope.currentChat._id, {
                    userId: $scope.user._id,
                    username: $scope.user.username,
                    profilePicture: $scope.user.profilePicture
                });

                //Setup the current chat state
                $scope.infiniteItems = new InfiniteScrollItems(RESTapi.getChatLength, RESTapi.getChatMessages, RESTapi.getAllContacts);
            },
            (reason) => {}
        );
    };

    RESTapi.ioOn('remove contact from  chat view', function(data){
        $timeout(function(){
            let index = $scope.chatView.contactList.findIndex(item => item.userId === data);
            if(index >= 0){
                $scope.chatView.contactList.splice(index,1);
            }
        },0);
    });

        //CONTACT DATA LOADING ON CONNECTION
    //Receive data back from the contact
    RESTapi.ioOn('copying contact data', function(data){
        //Check if the user is already in the user list
        let index:number = $scope.chatView.contactList.findIndex(item => item.userId === data.userId);
        if(index < 0){
            //If we have stablished a viewname for the user set it to be shown, else keep the username
            let index:number = $scope.user.contacts.findIndex(item => item.contactId === data.userId);
            if(index >= 0){
                data.username = $scope.user.contacts[index].viewname;
            }

            //Push the user to the chat contacts array
            $timeout(function(){
                $scope.chatView.contactList.push(data);
            },0);
        }
    });

    //Receive data from a connected contact, send the user data back (data[0] is the contact socket.id)
    RESTapi.ioOn('send me your info', function(data){
        //Check if the user is already in the user list
        let index:number = $scope.chatView.contactList.findIndex(item => item.userId === data[0].userId);
        if(index < 0){
            //If we have stablished a viewname for the user set it to be shown, else keep the username
            let index:number = $scope.user.contacts.findIndex(item => item.contactId === data[1].userId);
            if(index >= 0){
                data[1].username = $scope.user.contacts[index].viewname;
            }

            //Push the user to the chat contacts array
            $timeout(function(){
                $scope.chatView.contactList.push(data[1]);
            },0);
        }

        //Send your data back even if the user has already the data, maybe he lost it
        RESTapi.ioEmit('hello here is my data', data[0], {
            userId: $scope.user._id,
            username: $scope.user.username,
            profilePicture: $scope.user.profilePicture
        });
    });


        //CONTACT ADD/REMOVE
    $scope.addChatContact = function(event){
        $mdDialog.show({
            controller: 'ChatAddContactDialogController',
            templateUrl: '../views/dialog/addChatUser.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                currentChat: $scope.currentChat,
                contactList: $scope.user.contacts,
                chatView: $scope.chatView,
                addChatToUsers: addChatToUsers
            }
        })
            .then(
                (response) => {},
                (reason) => {}
            )
    };
    RESTapi.ioOn('new chat contact added', function(data){
        for(let i:number = 0; i < data.length; i++){
            $scope.currentChat.contacts.push(data[i].contactId);
            $scope.chatView.chatContactList.push({
                userId: data[i].contactId,
                profilePicture:data[i].profilePicture,
                username: data[i].viewname
            })
        }
    });

    $scope.removeChatContact = function(event:MouseEvent):void{
        $mdDialog.show({
            controller: 'ChatRemoveContactDialogController',
            templateUrl: '../views/dialog/removeChatUser.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {
                currentChat: $scope.currentChat,
                chatView: $scope.chatView,
                currentUser: $scope.user,
                removeUserFromChatRoom: removeUserFromChatRoom
            }
        })
            .then(
                (response) => {

                },
                (reason) => {

                }
            )
    };



        //MESSAGE SEND/RECEIVE
    //Message input send through key events
    $scope.shiftDown = function(event:KeyboardEvent):void{
        if(event.keyCode === 16){
            shiftNotPressed = false;
        }
    };
    $scope.shiftUp = function(event:KeyboardEvent):void{
        if(event.keyCode === 16){
            shiftNotPressed = true;
        }
    };

    $scope.keypressed = function(event:KeyboardEvent):void{
        if(event.keyCode === 13 && shiftNotPressed && $scope.message !== ""){
            $scope.broadcastMessage(event);
        }
    };

    $scope.broadcastMessage = function(event:KeyboardEvent):void{
        let message:app.IMessageUnit = {
            user: $scope.user._id,
            username: $scope.user.username,
            profilePicture: $scope.user.profilePicture,
            text: null,
            image: $scope.canvasFlag,
            date: null
        };

        if($scope.canvasFlag){
            message.text = canvas.toDataURL();
            $scope.canvasFlag = false;
        }
        else{
            message.text = $scope.messages;
        }

        //Write message on own chat space
        RESTapi.insertMessage({
            id: $scope.currentChat._id,
            message: message
        })
        .then(
            (response) => {
                writeMessage(response);
                //Broadcast the message
                RESTapi.ioEmit('chat message', $scope.currentChat._id, response);
            },
            (reason) => {}
        );

        //Clear the message input and resize it to its original state
        $scope.messages = null;
        event.preventDefault();
        $scope.$broadcast('md-resize-textarea');
    };

    //Receive a message from another user
    RESTapi.ioOn('receive message', function(message){
        writeMessage(message);
    });

    //Create a message and write it on the infinite scroll
    let writeMessage:(message:app.IMessageUnit)=>void = function(message:app.IMessageUnit):void{
        //Search for the user visual information if not this user
        if(message.user !== $scope.user._id){
            let index:number = $scope.chatView.contactList.findIndex(item => item.userId === message.user);
            message.username = $scope.chatView.contactList[index].username;
        }
        $scope.infiniteItems.insertNewMessage(message);
    };



}])

.controller("ContactDialogController",["$scope", "$filter", "$q", "$mdDialog", "EMAIL_RE", "RESTapi", "user",
    function($scope:app.IChatScope,
             $filter:angular.IFilterService,
             $q:angular.IQService,
             $mdDialog:angular.material.IDialogService,
             EMAIL_RE,
             RESTapi,
             user:app.IAppUser
    ){
    $scope.tags = [];
    let rejected:app.IRejected = {
        notEmail: [],
        notFound: [],
        alreadyContact: [],
        ownEmail: false
    };

    $scope.hide = function():void{
        $mdDialog.hide();
    };
    $scope.cancel = function():void{
        $mdDialog.cancel();
    };
    $scope.answer = function(answer:string):void{
        $mdDialog.hide(answer);
    };

    //Validate the adding contacts list and add them to the corresponding user
    $scope.validateAddContacts = function(ev:MouseEvent):void{
        let promises:any[] = [];
        let contacts:string[] = [];
        $scope.tags.forEach(function(contact, index){
            //Validate the contact is an email
            if(EMAIL_RE.test(contact)){
                //Check that the email is not the contact's own email
                if(contact === user.email){
                    rejected.ownEmail = true;
                }
                else{
                    contacts.push(contact);
                    promises.push(RESTapi.userData({
                        params: {
                            searchBy: { email: contact },
                            fields: 'email username profilePicture'
                        }
                    }));
                }
            }
            else{
                rejected.notEmail.push(contact);
            }
        });

        //Once all promises return, continue
        let reqPromises:any[] = [];
        $q.all(promises)
            .then(
                (values) => {
                    values.forEach(function(contact, index){
                        if(contact['data']){
                            //Search for already added contacts
                            let index:number = user.contacts.findIndex(item => item.contactId === contact['data']._id);
                            if(index >= 0 && user.contacts[index].status > 0){
                                rejected.alreadyContact.push(contact['data'].email);
                            }
                            else{
                                //Add the contact to the user
                                RESTapi.insertUpdateContact({
                                    id: user._id,
                                    contact: {
                                        contactId: contact['data']._id,
                                        username: contact['data'].username,
                                        viewname: contact['data'].username,
                                        profilePicture: contact['data'].profilePicture,
                                        status: 100
                                    }
                                })
                                    .then(
                                        (response) => {
                                            //Signal the contact that new contacts have been added
                                            //The server will signal the user to add the contacts through its own
                                            //room --> user._id, and to load them into the list
                                            RESTapi.ioEmit('new contacts', contact['data']._id, 200, response);
                                        }
                                    );

                                //And add the user to the contact
                                reqPromises.push(RESTapi.insertUpdateContact({
                                    id: contact['data']._id,
                                    contact: {
                                        contactId: user._id,
                                        username: user.username,
                                        viewname: user.username,
                                        profilePicture: user.profilePicture,
                                        status: 200
                                    }
                                }));
                            }
                        }
                        else{
                            rejected.notFound.push(contacts[index]);
                        }
                    });

                    //After all promises to the requester are fulfilled, load the contacts list
                    $q.all(reqPromises)
                        .then(
                            (response) => {
                                RESTapi.ioEmit('new contacts', user._id, 100, ...response);
                            },
                            (reason) => {console.log('Failed?');}
                        );

                    //Create contacts rejected message, if any, show an alert
                    let rejectedContacts:string = "";
                    if(rejected.ownEmail){
                        rejectedContacts += $filter('translate')('REJECTED_1');
                    }
                    if(rejected.notFound.length > 0){
                        rejectedContacts += $filter('translate')('REJECTED_2') + (rejected.notFound.length === 1 ? rejected.notFound[0] : rejected.notFound.join(", ")) + ".";
                    }
                    if(rejected.notEmail.length > 0){
                        rejectedContacts += $filter('translate')('REJECTED_3') + (rejected.notEmail.length === 1 ? rejected.notEmail[0] : rejected.notEmail.join(", ")) + ".";
                    }
                    if(rejected.alreadyContact.length > 0){
                        rejectedContacts += $filter('translate')('REJECTED_3') + (rejected.alreadyContact.length === 1 ? rejected.alreadyContact[0] : rejected.alreadyContact.join(", ")) + ".";
                    }

                    //If there is invalid input, then show the alert
                    if(rejectedContacts !== ""){
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .clickOutsideToClose(true)
                                .title($filter('translate')('CONTACT_ALERT'))
                                .textContent(rejectedContacts)
                                .ariaLabel(rejectedContacts)
                                .ok($filter('translate')('CLOSE'))
                                .targetEvent(ev)
                        );
                    }
                },
                (reason) => {console.log('Failed?');}
            );

        $scope.hide();
    };

}])

.controller("ChatDialogController", ["$scope", "$filter", "$mdDialog", "RESTapi", "currentChat", "addToOneOnOneChat", "addChatToUsers", "setCurrentChat", "loadChat", "user",
    function(
        $scope:app.IChatScope,
        $filter:angular.IFilterService,
        $mdDialog:any,
        RESTapi,
        currentChat:app.IAppChat,
        addToOneOnOneChat:Function,
        addChatToUsers:Function,
        setCurrentChat:Function,
        loadChat:Function,
        user:app.IAppUser
    ){

    $scope.contactList = user.contacts;
    $scope.contactsSelected = []; //Contains the contacts indexes
    let contactIds:string[] = [];

    //Show control functions
    $scope.hide = function(){
        $mdDialog.hide();
    };
    $scope.cancel = function(){
        $mdDialog.cancel();
    };
    $scope.answer = function(answer){
        $mdDialog.hide(answer);
    };

    //Checkbox control functions
    $scope.toggle = function(index){
        let i:number = $scope.contactsSelected.indexOf(index);
        if(i > -1){
            $scope.contactsSelected.splice(i, 1);
            contactIds.splice(i, 1);
        }
        else{
            $scope.contactsSelected.push(index);
            contactIds.push($scope.contactList[index].contactId);
        }
    };
    $scope.exists = function(index){
        return $scope.contactsSelected.indexOf(index) > -1;
    };

    //Group settings
    //$scope.groupName is available through ng-model
    $scope.groupPicture = 0;
    $scope.groupPictures = [
        'img/groupPictures/gp1.png',
        'img/groupPictures/gp2.png',
        'img/groupPictures/gp3.png',
        'img/groupPictures/gp4.png',
        'img/groupPictures/gp5.png',
        'img/groupPictures/gp6.png',
        'img/groupPictures/gp7.png',
        'img/groupPictures/gp8.png',
        'img/groupPictures/gp9.png',
        'img/groupPictures/gp10.png'
    ];
    $scope.isGroup = function():boolean{
        return $scope.contactsSelected.length > 1;
    };

    $scope.selectPic = function(index){
        $scope.groupPicture = index;
    };

    //Validate the chat creation parameters, if everything good, create the chat and notificate the users
    $scope.validateNewChat = function(ev:MouseEvent):void{
        if($scope.contactsSelected.length > 1 && (!$scope.groupName || $scope.groupName === "")){
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title($filter('translate')('CHAT_ALERT'))
                .textContent($filter('translate')('CHAT_NAME'))
                .ariaLabel('Please provide a name for your group')
                .ok($filter('translate')('CLOSE'))
                .multiple(true)
                .targetEvent(ev)
            );
        }
        else{
            //create the chat room
            RESTapi.createChatRoom([...contactIds, user._id])
            .then(
                (response) => {
                    //New Chat room is created, add the room information to each user
                    if(response){
                        //Set the new chat room as the current room
                        if(currentChat && currentChat._id !== response._id){
                            RESTapi.ioEmit('remove from chat view', $scope.currentChat._id, $scope.user._id);
                            RESTapi.ioEmit('leave room', currentChat._id);
                        }
                        currentChat = response;
                        setCurrentChat(currentChat);

                        //Insert the chat information to each user
                        if(currentChat.contacts.length === 2){
                            //One to one chat
                            //Sets each others avatar and view name in the chat list
                            //Get the contact, then write on the others profile
                            addToOneOnOneChat(currentChat.contacts, currentChat._id);
                        }
                        //The chat room has more than two participants
                        else{
                            //Cycle through each contact and insert the chat room information
                            for(let i:number = 0; i < currentChat.contacts.length; i++){
                                addChatToUsers({
                                    id: currentChat.contacts[i],
                                    chat: {
                                        chatId: currentChat._id,
                                        chatname: $scope.groupName,
                                        chatPicture: $scope.groupPictures[$scope.groupPicture]
                                    }
                                });
                            }
                        }
                    }
                    //The group already exists, notify the user
                    else{
                        //And access the intended chat
                        if(contactIds.length === 1){
                            loadChat([...contactIds, user._id], null, true);
                        }
                        else{
                            loadChat([...contactIds, user._id], null, false);
                        }


                        //Notify the useer
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .clickOutsideToClose(true)
                                .title($filter('translate')('CHAT_ALERT'))
                                .textContent($filter('translate')('ALREADY_IN_GROUP'))
                                .ariaLabel('You are already in a chat group with these contacts')
                                .ok($filter('translate')('CLOSE'))
                                .multiple(true)
                                .targetEvent(ev)
                        );
                    }
                },
                (reason) => {}
            );

            $scope.hide();
        }
    }
}])

.controller("ChatAddContactDialogController",["$scope", "$filter", "$q", "$mdDialog", "RESTapi", "currentChat", "contactList", "chatView", "addChatToUsers",
function($scope:app.IChatScope,
         $filter:angular.IFilterService,
         $q:angular.IQService,
         $mdDialog:any,
         RESTapi,
         currentChat:app.IAppChat,
         contactList:app.IAppUserContact[],
         chatView:app.IChatView,
         addChatToUsers:Function
){
    $scope.contacts = [];
    //Extract the list of the user's contacts not in the chat room contact list
    for(let c of contactList){
        let found:app.IChatContactList = chatView.chatContactList.find(item => item.userId === c.contactId);
        if(!found){
            $scope.contacts.push(c);
        }
    }

    //Checkbox control functions
    $scope.contactsSelected = []; //Contains the contacts indexes
    let contactIds:string[] = [];
    $scope.toggle = function(index){
        let i:number = $scope.contactsSelected.indexOf(index);
        if(i > -1){
            $scope.contactsSelected.splice(i, 1);
            contactIds.splice(i, 1);
        }
        else{
            $scope.contactsSelected.push(index);
            contactIds.push($scope.contacts[index].contactId);
        }
    };
    $scope.exists = function(index){
        return $scope.contactsSelected.indexOf(index) > -1;
    };

    $scope.hide = function(){
        $mdDialog.hide();
    };
    $scope.cancel = function(){
        $mdDialog.cancel();
    };
    $scope.answer = function(answer){
        $mdDialog.hide(answer);
    };

    //Validate the adding contacts list and add them to the corresponding user
    $scope.validateNewChatContact = function(ev:MouseEvent):void{
        //Add the chat to the user's profile
        for(let i:number = 0; i < contactIds.length; i++){
            currentChat.contacts.push(contactIds[i]);
            addChatToUsers({
                id: contactIds[i],
                chat: {
                    chatId: currentChat._id,
                    chatname: chatView.chatname,
                    chatPicture: chatView.chatPicture
                }
            })
        }

        //Add the user to the chat room contact list
        RESTapi.updateChatRoom({
            id: currentChat._id,
            data: currentChat
        })
            .then(
                (response) => {
                    //Notify the users to update their current chat state in case the new users connect
                    RESTapi.ioEmit('add contacts to chat', currentChat._id, $scope.contacts);
                },
                (reason) => {}
            );

        $scope.hide();
    };
}])

.controller("ChatRemoveContactDialogController",["$scope", "$filter", "$q", "$mdDialog", "RESTapi", "currentChat", "chatView", "currentUser", "removeUserFromChatRoom",
function($scope:app.IChatScope,
         $filter:angular.IFilterService,
         $q:angular.IQService,
         $mdDialog:any,
         RESTapi,
         currentChat:app.IAppChat,
         chatView:app.IChatView,
         currentUser:app.IAppUser,
         removeUserFromChatRoom:Function
){
    $scope.removeContacts = chatView.chatContactList;

    //Remove own user from the list
    let index:number = $scope.removeContacts.findIndex(item => item.userId === currentUser._id);
    if(index >= 0){
        $scope.removeContacts.splice(index,1);
    }

    //Checkbox control functions
    $scope.contactsSelected = []; //Contains the contacts indexes
    let contactIds:string[] = [];
    $scope.toggle = function(index){
        let i:number = $scope.contactsSelected.indexOf(index);
        if(i > -1){
            $scope.contactsSelected.splice(i, 1);
            contactIds.splice(i, 1);
        }
        else{
            $scope.contactsSelected.push(index);
            contactIds.push($scope.removeContacts[index].userId);
        }
    };
    $scope.exists = function(index){
        return $scope.contactsSelected.indexOf(index) > -1;
    };

    $scope.hide = function(){
        $mdDialog.hide();
    };
    $scope.cancel = function(){
        $mdDialog.cancel();
    };
    $scope.answer = function(answer){
        $mdDialog.hide(answer);
    };

    //Validate the adding contacts list and add them to the corresponding user
    $scope.validateChatRemoveContact = function(ev:MouseEvent):void{
        let confirm:any = $mdDialog.confirm()
            .title($filter('translate')('ALERT_REMOVE_CONTACT'))
            .textContent($filter('translate')('REMOVE_CONTACT_TEXT'))
            .ariaLabel('Remove contact(s) from chat room?')
            .targetEvent(event)
            .ok($filter('translate')('REMOVE'))
            .cancel($filter('translate')('CANCEL'));

        $mdDialog.show(confirm)
        .then(
            (response) => {
                //Cycle through all removed users and remove from the chat
                for(let i:number = 0; i < contactIds.length; i++){
                    removeUserFromChatRoom(currentChat._id, contactIds[i]);
                }
            },
            (reason) => {}
        );
        $scope.hide();
    };
}]);
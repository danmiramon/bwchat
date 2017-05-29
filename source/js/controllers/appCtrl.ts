angular.module('chatApp')
.controller("mainCtrl", ["$scope", "$http", "$location", "$q", "$timeout", "RESTapi", function(
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    $q:angular.IQService,
    $timeout,
    RESTapi
){
    //GLOBAL VARIABLES
    $scope.error = null;
    //$scope.loggedin = false;

    //Connect to the socket
    RESTapi.ioConnect();
    RESTapi.ioOn('get login data', function(data){
        // $timeout(function(){
            $scope.user = data;
            //$scope.loggedin = true;
        // },0);
    });

    //Log in
    $scope.login = function(user:any){
        RESTapi.login(user)
        .then(
            (response) => {
                $scope.user = response;
                $scope.loggedin = true;
            },
            (reason) => {}
        );
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

        RESTapi.signup(user)
        .then((response) => {
            $scope.user = response;
            $scope.loggedin = true;
        },
            (reason) => {

        });
    };

    //Logout
    $scope.logout = function(){
        $scope.user = null;
        //$scope.loggedin = false;
        RESTapi.logout();
        $scope.error = null;
    };
}])

.controller("menuCtrl", ["$scope", "$http", "$timeout", "orderByFilter", "$location", "$q", "$mdDialog", "$mdMenu", "RESTapi", function(
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $timeout:angular.ITimeoutService,
    orderBy:angular.IFilterOrderBy,
    $location:angular.ILocationService,
    $q:angular.IQService,
    $mdDialog,
    $mdMenu,
    RESTapi,
){
    //VARIABLES




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
            label: 'people',
            address: 'views/menu/contacts.html'
        },
        {
            tooltip: 'Chats',
            label: 'chat',
            address: 'views/menu/chats.html'
        }
    ];

    $scope.dataLoad = function(menu){
        elementsSelected = [];
        $scope.remove = false;
        switch(menu){
            case 'Profile': {
                $timeout(function(){
                    $scope.profile = {
                        profilePicture: $scope.user.profilePicture,
                        firstname: $scope.user.firstname,
                        lastname: $scope.user.lastname,
                        username: $scope.user.username,
                        language: $scope.user.language
                    };
                    $scope.selectedPicture = $scope.profileImages.indexOf($scope.user.profilePicture);
                });

                //profileLoad();
                break;
            }
            case 'Contacts': {
                //contactsLoad();
                break;
            }
            case 'Chats': {
                //contactsLoad();
                //chatsLoad();
                break;
            }
        }
    };


    //CONTACTS & CHATS
    //Checkbox control functions
    $scope.remove = false;
    let elementsSelected = []; //Selected items
    //Toggles the checkbox value
    $scope.toggle = function(index){
        let i = elementsSelected.indexOf(index);
        if(i > -1){
            elementsSelected.splice(i, 1);
        }
        else{
            elementsSelected.push(index);
        }
    };

    //Checks that the element (contact/chat) exists in the selected items array
    $scope.exists = function(index){
        return elementsSelected.indexOf(index) > -1;
    };

    //Toogles the multi remove button
    $scope.removeToggle = function(collection, event, value){
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
    $scope.sortBy = function(collection, field, reverse){
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
    $scope.selectPic = function(index){
        $scope.selectedPicture = index;
        $scope.profile.profilePicture = $scope.profileImages[index];
    };

    $scope.profileUpdate = function(){
        //If there are changes in the picture or username, update all the contacts and personal chat data
        if($scope.profile.profilePicture !== $scope.user.profilePicture || $scope.profile.username !== $scope.user.username){
            for(let contact of $scope.user.contacts){
                //Update contacts
                let config =  {
                    id: contact.contactId,
                    profilePicture: $scope.profile.profilePicture,
                    username: $scope.profile.username
                };
                RESTapi.updateUserProfileInContact(config)
                .then(
                    (response) => {
                        //Finally emit a messaga to the contacts to update their views
                        RESTapi.ioEmit('contact profile update',
                            response._id,
                            response.contacts[0].contactId,
                            response.contacts[0].profilePicture,
                            response.contacts[0].username);

                        //Update one-to-one chat images if found
                        let config = {
                            params: {
                                id: null,
                                contacts: [response._id, response.contacts[0].contactId],
                                privateChat: false
                            }
                        };
                        RESTapi.getChat(config)
                        .then(
                            (responseChat) => {
                                //If a chat is found, update it
                                if(responseChat){
                                    let config =  {
                                        id: response._id,
                                        profilePicture: response.contacts[0].profilePicture
                                    };
                                    RESTapi.updateUserContactChat(config)
                                        .then(
                                            (responseUserChat) => {
                                                //Finally emit a messaga to the contacts to update their views
                                                RESTapi.ioEmit('contact chat update',
                                                    responseUserChat._id,
                                                    responseUserChat.chats[0].chatId,
                                                    responseUserChat.chats[0].chatPicture);
                                            },
                                            (reason) => {}
                                        )
                                }
                            },
                            (reason) => {}
                        )
                    },
                    (reason) => {}
                )
            }

            //Update user view data and database fields
            $scope.user.firstname = $scope.profile.firstname;
            $scope.user.lastname = $scope.profile.lastname;
            $scope.user.username = $scope.profile.username;
            $scope.user.language = $scope.profile.language;
            $scope.user.profilePicture = $scope.profile.profilePicture;
            RESTapi.updateUserData($scope.profile)
            .then(
                (response) => {},
                (reason) => {
                    console.log('Error ' + reason);
                }
            );
        }
    };

    //Uodate the view from a profile change in a contact
    RESTapi.ioOn('update contact profile', function(data){
        $timeout(function(){
            let index = $scope.user.contacts.findIndex(item => item.contactId === data[0]);
            $scope.user.contacts[index].profilePicture = data[1];
            $scope.user.contacts[index].username = data[2];
        }, 0);
    });
    RESTapi.ioOn('update contact chat', function(data){
        $timeout(function(){
            let index = $scope.user.chats.findIndex(item => item.chatId === data[0]);
            $scope.user.chats[index].chatPicture = data[1];
        }, 0);
    });



        //CONTACTS
    $scope.addContact = function(event){
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
            for(let i = 1; i < data.length; i++){
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

    $scope.goToChat = function(event, index, status){
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
                        if($scope.currentChat){
                            RESTapi.ioEmit('leave room', $scope.currentChat._id);
                        }
                        $scope.currentChat = response;

                        //Insert the chat information to each user
                        //One to one chat
                        //Sets each others avatar and view name in the chat list
                        //Get the contact, then write on the others profile
                        for(let i = 0, j = 1; i < 2; i++, j--){
                            let config = {
                                params: {
                                    contactFrom: $scope.currentChat.contacts[i],
                                    contactTo: $scope.currentChat.contacts[j]
                                }
                            };
                            RESTapi.getUserContact(config)
                                .then(
                                    (response) => {
                                        let insertChat = {
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

    $scope.editViewName = function(event, index, status){
        if(status < 300){
            //Cannot modify unaccepted contacts viewname
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Contact Alert')
                .textContent('Cannot modify the username of unaccepted contacts')
                .ariaLabel('Cannot modify the username of unaccepted contacts')
                .ok('Close')
                .targetEvent(event)
            );
        }
        else{
            //Edit the contact's viewname
            let confirm = $mdDialog.prompt()
                .title('Do you want to change ' + $scope.user.contacts[index].viewname + ' username?')
                .placeholder('Contact Name')
                .ariaLabel('Contact Name')
                .initialValue($scope.user.contacts[index].viewname)
                .targetEvent(event)
                .ok('Change contact name')
                .cancel('Cancel');

            $mdDialog.show(confirm)
            .then(
                function(response){
                    //Show an alert if the viewname is empty
                    if(response === ""){
                        $mdDialog.show(
                            $mdDialog.alert()
                            .parent(angular.element(document.body))
                            .clickOutsideToClose(true)
                            .title('Contact Name Alert')
                            .textContent('Contacts must have a name')
                            .ariaLabel('Contacts must have a name')
                            .ok('Close')
                            .targetEvent(event)
                        );
                    }
                    //Modify the contact's username
                    else{
                        //Update contact viewname in the database
                        $scope.user.contacts[index].viewname = response;
                        let updateContact = {
                            id: $scope.user._id,
                            contact: $scope.user.contacts[index]
                        };
                        RESTapi.insertUpdateContact(updateContact)
                        .then(
                            (response) => {
                                $mdDialog.show(
                                    $mdDialog.alert()
                                    .parent(angular.element(document.body))
                                    .clickOutsideToClose(true)
                                    .title('Contact Name Changed')
                                    .textContent('Your view name for ' + $scope.user.contacts[index].username + ' is now ' + $scope.user.contacts[index].viewname)
                                    .ariaLabel('Your view name for ' + $scope.user.contacts[index].username + ' is now ' + $scope.user.contacts[index].viewname)
                                    .ok('Close')
                                    .targetEvent(event)
                                );
                            },
                            (reason) => {}
                        )
                    }
                },
                function(reason){}
            )
        }
    };

    $scope.acceptContactRequest = function(index){
        //Update contact in the user database
        $scope.user.contacts[index].status = 300; //Request accepted
        let updateContact = {
            id: $scope.user._id,
            contact: $scope.user.contacts[index]
        };
        RESTapi.insertUpdateContact(updateContact)
            .then(
                (response) => {},
                (reason) => {}
            );

        //Update user data in the contact database
        updateContact = {
            id: $scope.user.contacts[index].contactId,
            contact: {
                contactId: $scope.user._id,
                username: $scope.user.username,
                viewname: $scope.user.username,
                profilePicture: $scope.user.profilePicture,
                status: 300
            }
        };
        RESTapi.insertUpdateContact(updateContact)
            .then(
                (response) => {
                    RESTapi.ioEmit('accept request', $scope.user.contacts[index].contactId, $scope.user._id);
                },
                (reason) => {}
            )
    };

    RESTapi.ioOn('request accepted', function(contact){
        let index = $scope.user.contacts.findIndex(item => item.contactId === contact);
        $timeout(function(){
            $scope.user.contacts[index].status = 300;
        }, 0);
    });

    //Contact remove function
    $scope.removeContact = function(event, index){
        let confirm = $mdDialog.confirm()
            .title('Remove contact(s)?')
            .textContent('Are you sure you want to remove this contact(s)?')
            .ariaLabel('Remove contact(s)?')
            .targetEvent(event)
            .ok('Remove it')
            .cancel('Cancel');

        $mdDialog.show(confirm)
        .then(
            (response) => {
                //List of contacts to be effectively removed
                let removeList = [];
                let counter = 0;
                //If we get an index is because the trash can or reject button were pressed
                if(index !== null){
                    removeList.push($scope.user.contacts[index].contactId);
                    removePrivateChatRoom(removeList[counter], $scope.user._id);
                    updateOnDelete(removeList[counter]);
                    $scope.user.contacts[index].status = 0;
                    $scope.user.contacts[index].contactId = "-1";
                    counter++;

                    if($scope.exists(index)){ $scope.toggle(index); }
                }
                //Otherwise, a list of contacts must exist
                else{
                    for(let i of elementsSelected){
                        removeList.push($scope.user.contacts[i].contactId);
                        removePrivateChatRoom(removeList[counter], $scope.user._id);
                        updateOnDelete(removeList[counter]);
                        $scope.user.contacts[i].status = 0;
                        $scope.user.contacts[i].contactId = "-1";
                        counter++;
                    }
                    elementsSelected = [];
                }

                //If the remove list have elements, delete them from the database
                if(removeList.length > 0){
                    let config = {
                        params: {
                            userId: $scope.user._id,
                            contacts: removeList
                        }
                    };
                    RESTapi.deleteContact(config)
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
    let updateOnDelete = function(contact){
        //Remove this user data from the contact database
        let config = {
            params: {
                userId: contact,
                contacts: [$scope.user._id]
            }
        };
        RESTapi.deleteContact(config)
            .then(
                (response) => {
                    RESTapi.ioEmit('contact deleted', contact, $scope.user._id); //Tell the contact to "status = 0" this user
                },
                (reason) => {}
            );
    };

    RESTapi.ioOn('remove contact', function(contact){
        let index = $scope.user.contacts.findIndex(item => item.contactId === contact);
        if(index >= 0){
            $timeout(function(){
                $scope.user.contacts[index].status = 0;
                if($scope.selectedTab === 1 && $scope.exists(index)){ $scope.toggle(index); } //Remove the "checkbox" of the deleted item if selected
                $scope.user.contacts[index].contactId = "-1";
            }, 0);
        }
    });

    let removePrivateChatRoom = function(contactId, userId){
        //Look for a private chat room
        let config = {
            params: {
                id: null,
                contacts: [contactId, userId],
                privateChat: true
            }
        };
        RESTapi.getChat(config)
        .then(
            (response) => {
                if(response){
                    let index = $scope.user.chats.findIndex(item => item.chatId === response._id);
                    if(index >= 0)
                    {
                        $timeout(function(){
                            if($scope.currentChat && $scope.currentChat._id === response._id){
                                $scope.currentChat = null;
                            }
                            $scope.user.chats[index].status = 0;
                            //Inform the contact to remove the chat from its chat list
                            RESTapi.ioEmit('chat deleted', contactId, response._id);
                            $scope.user.chats[index].chatId = -1;
                        },0);

                        //Delete the chat room from the data base
                        //User first
                        let config = {
                            params: {
                                userId: userId,
                                chats: [response._id]
                            }
                        };
                        RESTapi.deleteChat(config)
                            .then(
                                (response) => {},
                                (reason) => {}
                            );
                        //Contact later
                        let config2 = {
                            params: {
                                userId: contactId,
                                chats: [response._id]
                            }
                        };
                        RESTapi.deleteChat(config2)
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
        let index = $scope.user.chats.findIndex(item => item.chatId === chat);
        if(index >= 0){
            $timeout(function(){
                if($scope.currentChat && $scope.currentChat._id === chat){
                    $scope.currentChat = null;
                }
                $scope.user.chats[index].status = 0;
                if($scope.selectedTab === 2 && $scope.exists(index)){ $scope.toggle(index); } //Remove the "checkbox" of the deleted item if selected
                $scope.user.chats[index].chatId = -1;
            }, 0);
        }
    });





        //CHATS MENU
    $scope.currentChat = null;
    let setCurrentChat = function(currChat){
        $scope.currentChat = currChat;
    };

    $scope.loadChat = function(participants, id, privateChat){
        //Access the intended chat
        let config = {
            params: {
                id: id,
                contacts: participants,
                privateChat: privateChat
            }
        };
        RESTapi.getChat(config)
            .then(
                (response) => {
                    //Set the found chat room as the current room
                    if($scope.currentChat){
                        RESTapi.ioEmit('leave room', $scope.currentChat._id);
                    }
                    $scope.currentChat = response;
                    let index = $scope.user.chats.findIndex(item => item.chatId === response._id);
                    if(index >= 0){
                        RESTapi.ioEmit('join chat room', response._id, $scope.user._id, function(){
                            openChat();
                            console.log($scope.chatView);
                        });
                    }
                    else{
                        //If the chat is private and the users have been readded after a deletion, the chat information
                        //must be re-added as well on the first attemt of contact
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
    $scope.addChat = function(event){
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

    let addToOneOnOneChat = function(contacts, chatId){
        for(let i = 0, j = 1; i < 2; i++, j--){
            let config = {
                params: {
                    contactFrom: contacts[i],
                    contactTo: contacts[j]
                }
            };
            RESTapi.getUserContact(config)
                .then(
                    (response) => {
                        let insertChat = {
                            id: response._id,
                            chat: {
                                chatId: chatId,
                                chatname: response.contacts[0].viewname,
                                chatPicture: response.contacts[0].profilePicture
                            }
                        };
                        addChatToUsers(insertChat);
                    }
                )
        }
    };

    let addChatToUsers = function(chatData){
        RESTapi.insertUserChat(chatData)
            .then(
                (response) => { //Response contains the chat information and each user contactId
                    //Launch a message to all the users (including this) to update the view
                    RESTapi.ioEmit('chat room added', response);
                    if(response.id === $scope.user._id){
                        //Join the newly created chat
                        RESTapi.ioEmit('join chat room', response.chat.chatId, $scope.user._id, function(){
                            openChat();
                            console.log($scope.chatView);
                        });
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
    $scope.removeChat = function(event, index){
        let confirm = $mdDialog.confirm()
            .title('Remove chat room(s)?')
            .textContent('Are you sure you want to remove this chat room(s)?')
            .ariaLabel('Remove chat room(s)?')
            .targetEvent(event)
            .ok('Remove it')
            .cancel('Cancel');

        $mdDialog.show(confirm)
            .then(
                (response) => {
                    //List of chats to be effectively removed
                    let removeList = [];
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
                        let config = {
                            params: {
                                id: chatRoom,
                                contacts: null,
                                privateChat: false
                            }
                        };
                        //Get the chat room information
                        RESTapi.getChat(config)
                        .then(
                            (response) => {
                                //Treat group rooms
                                if(response.groupRoom){
                                    //Remove the contact from the chat room
                                    removeContactFromChatRoom(response);

                                    //Remove just for this user
                                    removeChatRoom(response._id, $scope.user._id);
                                }
                                //Treat One-To-One rooms
                                else{
                                    for(let i = 0; i < 2; i++){
                                        //Remove from both ends
                                        removeChatRoom(response._id, response.contacts[i]);
                                    }
                                }
                            },
                            (reason) => {}
                        )
                    }
                },
                (reason) => {}
            );
    };

    let removeChatRoom = function(chatId, userId){
        //Remove the chat from the view
        RESTapi.ioEmit('chat deleted', userId, chatId);

        //Remove the chat from the user database
        let config = {
            params: {
                userId: userId,
                chats: [chatId]
            }
        };
        RESTapi.deleteChat(config)
            .then(
                (response) => {},
                (reason) => {}
            );
    };

    let removeContactFromChatRoom = function(chatRoom){
        //TODO test this by removing users one by one
        //Check if the user is the last one to leave the chat room
        if(chatRoom.contacts.length === 1){
            let config = {
                params: {
                    id: chatRoom._id
                }
            };
            RESTapi.deleteChatRoom(config)
                .then(
                    (response) => {},
                    (reason) => {}
                )
        }
        //TODO
        //TODO
        //TODO
        //TODO Check this one if the chat contents gets deleted when removing users when this is working
        //If more users remain, just update the chat room without the user
        else{
            //Remove the user from the chat room participants
            let index = chatRoom.contacts.findIndex(item => item === $scope.user._id);
            chatRoom.contacts.splice(index, 1);

            //Update the chat room
            let config = {
                id: chatRoom._id,
                data: chatRoom
            };
            RESTapi.updateChatRoom(config)
                .then(
                    (response) => {},
                    (reason) => {}
                )
        }
    };






        //CHAT ROOM WINDOW MANAGEMENT
    //TODO Open chat, final chat option, do it last
    $scope.chatView = {
        chatname: null
    };
    let openChat = function(){
        //Get the chat position in the user's chat list
        let chatIndex = $scope.user.chats.findIndex(item => item.chatId === $scope.currentChat._id);

        //Set the chatname
        $scope.chatView.chatname = $scope.user.chats[chatIndex].chatname;
        console.log('here');
    };
}])

.controller("ContactDialogController",["$scope", "$q", "$mdDialog", "EMAIL_RE", "RESTapi", "user",
    function($scope,
             $q,
             $mdDialog,
             EMAIL_RE,
             RESTapi,
             user
    ){
    $scope.tags = [];
    let rejected = {
        notEmail: [],
        notFound: [],
        alreadyContact: [],
        ownEmail: false
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
    $scope.validateAddContacts = function(ev){
        let promises = [];
        let contacts = [];
        $scope.tags.forEach(function(contact, index){
            //Validate the contact is an email
            if(EMAIL_RE.test(contact)){
                //Check that the email is not the contact's own email
                if(contact === user.email){
                    rejected.ownEmail = true;
                }
                else{
                    //Configure the contacts search and populate a Promise array
                    let config = {
                        params: {
                            searchBy: { email: contact },
                            fields: 'email username profilePicture'
                        }
                    };
                    contacts.push(contact);
                    promises.push(RESTapi.userData(config));
                }
            }
            else{
                rejected.notEmail.push(contact);
            }
        });

        //Once all promises return, continue
        let reqPromises = [];
        $q.all(promises)
            .then(
                (values) => {
                    values.forEach(function(contact, index){
                        if(contact['data']){
                            //Search for already added contacts
                            let index = user.contacts.findIndex(item => item.contactId === contact['data']._id);
                            if(index >= 0 && user.contacts[index].status > 0){
                                rejected.alreadyContact.push(contact['data'].email);
                            }
                            else{
                                //Add the contact to the user
                                let addContact = {
                                    id: user._id,
                                    contact: {
                                        contactId: contact['data']._id,
                                        username: contact['data'].username,
                                        viewname: contact['data'].username,
                                        profilePicture: contact['data'].profilePicture,
                                        status: 100
                                    }
                                };
                                RESTapi.insertUpdateContact(addContact)
                                    .then(
                                        (response) => {
                                            //Signal the contact that new contacts have been added
                                            //The server will signal the user to add the contacts through its own
                                            //room --> user._id, and to load them into the list
                                            RESTapi.ioEmit('new contacts', contact['data']._id, 200, response);
                                        }
                                    );

                                //And add the user to the contact
                                addContact = {
                                    id: contact['data']._id,
                                    contact: {
                                        contactId: user._id,
                                        username: user.username,
                                        viewname: user.username,
                                        profilePicture: user.profilePicture,
                                        status: 200
                                    }
                                };
                                reqPromises.push(RESTapi.insertUpdateContact(addContact));
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
                        rejectedContacts += `Can\'t add yourself as a contact.`;
                    }
                    if(rejected.notFound.length > 0){
                        rejectedContacts += ` The following contacts are not in our database:
                        ${rejected.notFound.length === 1 ? rejected.notFound[0] : rejected.notFound.join(", ")}.`;
                    }
                    if(rejected.notEmail.length > 0){
                        rejectedContacts += ` The following contacts are not in e-mail format:
                        ${rejected.notEmail.length === 1 ? rejected.notEmail[0] : rejected.notEmail.join(", ")}.`;
                    }
                    if(rejected.alreadyContact.length > 0){
                        rejectedContacts += ` The following contacts are already in your contact list:
                        ${rejected.alreadyContact.length === 1 ? rejected.alreadyContact[0] : rejected.alreadyContact.join(", ")}.`;
                    }

                    //If there is invalid input, then show the alert
                    if(rejectedContacts !== ""){
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.body))
                                .clickOutsideToClose(true)
                                .title('Contact Alert')
                                .textContent(rejectedContacts)
                                .ariaLabel(rejectedContacts)
                                .ok('Close')
                                .targetEvent(ev)
                        );
                    }
                },
                (reason) => {console.log('Failed?');}
            );

        $scope.hide();
    };

}])

.controller("ChatDialogController", ["$scope", "$mdDialog", "RESTapi", "currentChat", "addToOneOnOneChat", "addChatToUsers", "setCurrentChat", "loadChat", "user",
    function(
        $scope,
        $mdDialog,
        RESTapi,
        currentChat,
        addToOneOnOneChat,
        addChatToUsers,
        setCurrentChat,
        loadChat,
        user
    ){

    $scope.contactList = user.contacts;
    $scope.contactsSelected = []; //Contains the contacts indexes
    let contactIds = [];

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
        let i = $scope.contactsSelected.indexOf(index);
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
    $scope.isGroup = function(){
        return $scope.contactsSelected.length > 1;
    };

    $scope.selectPic = function(index){
        $scope.groupPicture = index;
    };

    //Validate the chat creation parameters, if everything good, create the chat and notificate the users
    $scope.validateNewChat = function(ev){
        if($scope.contactsSelected.length > 1 && (!$scope.groupName || $scope.groupName === "")){
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Chat Room Alert')
                .textContent('Please provide a name for your group')
                .ariaLabel('Please provide a name for your group')
                .ok('Close')
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
                        if(currentChat){
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
                            for(let i = 0; i < currentChat.contacts.length; i++){
                                let insertChat = {
                                    id: currentChat.contacts[i],
                                    chat: {
                                        chatId: currentChat._id,
                                        chatname: $scope.groupName,
                                        chatPicture: $scope.groupPictures[$scope.groupPicture]
                                    }
                                };
                                addChatToUsers(insertChat);
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
                                .title('Chat Room Alert')
                                .textContent('You are already in a chat group with these contacts')
                                .ariaLabel('You are already in a chat group with these contacts')
                                .ok('Close')
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
}]);
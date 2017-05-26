angular.module('chatApp')
.controller("mainCtrl", ["$scope", "$http", "$location", "$q", "RESTapi", function(
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $location:angular.ILocationService,
    $q:angular.IQService,
    RESTapi
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

        RESTapi.signup(user)
        .then((response) => {
                setData();
        },
            (reason) => {
                setData();
        });
    };

    //Log in
    $scope.login = function(user:any){
        RESTapi.login(user)
        .then((response) => {
            setData();
        },
            (reason) => {
            setData();
        });
    };

    //Logout
    $scope.logout = function(){
        RESTapi.logout();
        $scope.logged = null;
        $scope.error = null;
    };

    let setData = function(){
        $scope.error = RESTapi.getError();
        $scope.logged = RESTapi.getUser();
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
    //Variables
    $scope.remove = false;
    $scope.currentChat = null;


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

    //Menu data loading
    //Get request config object
    let config = {
        params: null
    };
    //Helper functions
    let profileLoad = function(){
        config.params = {
            searchBy: { _id: RESTapi.getUser() },
            fields: 'firstname lastname username language profilePicture'
        };
        RESTapi.userData(config)
        .then(
            (response => {
                $scope.profile = response.data;
            })
        );
    };

    let contactsLoad = function(){
        $scope.remove = false;
        config.params = {
            searchBy: { _id: RESTapi.getUser() },
            fields: 'contacts'
        };
        RESTapi.userData(config)
        .then(
            (response => {
                $scope.contacts = response.data.contacts;
                $scope.selectedContact = [];
                $scope.sortBy('contacts', 'viewname', false);
            })
        );
    };

    //Reload the contacts list
    RESTapi.ioOn('load contacts', function(){
        contactsLoad();
    });

    let chatsLoad = function(){
        //$scope.remove = false;  <-- Initialized in contactsLoad()  THIS IS JUST A REMAINDER (Do not remove)
        config.params = {
            searchBy: { _id: RESTapi.getUser() },
            fields: 'chats'
        };
        RESTapi.userData(config)
        .then(
            (response => {
                $scope.chats = response.data.chats;
                $scope.selectedChats = [];
                $scope.sortBy('chats', 'chatname', false);
            })
        );
    };

    //Reload the cchats list
    RESTapi.ioOn('load chats', function(){
        chatsLoad();
    });

    $scope.dataLoad = function(menu){
        elementsSelected = [];
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
                contactsLoad();
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


    //CONTACTS & CHATS
    //Checkbox control functions
    let elementsSelected = [];

    $scope.toggle = function(index){
        let i = elementsSelected.indexOf(index);
        if(i > -1){
            elementsSelected.splice(i, 1);
        }
        else{
            elementsSelected.push(index);
        }
    };

    $scope.exists = function(index){
        return elementsSelected.indexOf(index) > -1;
    };

    //Toogles the multi remove button
    $scope.removeToggle = function(collection, event, value, del){
        $scope.remove = value;
        if(elementsSelected.length > 0){
            switch(collection){
                case 'contacts':{
                    $scope.removeContact(event, null);
                    break;
                }
                case 'chats':{
                    $scope.removeChat(event, null);
                }
            }
        }
    };

    //Sorting elements. Receives a collection name, a field and a reverse sort boolean
    $scope.sortBy = function(collection, field, reverse){
        elementsSelected = [];
        $scope[collection] = orderBy($scope[collection], field, reverse);
        $scope.remove = false;
    };






    //CONTACTS
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
                //If we get an index is because the trash can or reject button were pressed
                if(index !== null){
                    removeList.push($scope.contacts[index].contactId);
                    $scope.contacts[index].status = 0;
                    updateOnDelete($scope.contacts[index].contactId);

                    if($scope.exists(index)){ $scope.toggle(index); }
                }
                // //Otherwise, a list of contacts must exist
                else{
                    for(let i of elementsSelected){
                        removeList.push($scope.contacts[i].contactId);
                        $scope.contacts[i].status = 0;
                        updateOnDelete($scope.contacts[i].contactId);
                    }
                    elementsSelected = [];
                }

                //If the remove list have elements, delete them from the database
                if(removeList.length > 0){
                    config = {
                        params: {
                            userId: RESTapi.getUser(),
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

    RESTapi.ioOn('remove contact', function(contact){
        for(let i in $scope.contacts){
            if($scope.contacts[i].contactId === contact){
                $timeout(function(){
                    $scope.contacts[i].status = 0;
                    if($scope.exists(i)){ $scope.toggle(i); } //Remove the "checkbox" of the deleted item if selected
                }, 0);
                break;
            }
        }
    });

    //Remove element from the user view
    let updateOnDelete = function(contact){
        //Remove this user data from the contact database
        config = {
            params: {
                userId: contact,
                contacts: [RESTapi.getUser()]
            }
        };
        RESTapi.deleteContact(config)
        .then(
            (response) => {
                RESTapi.ioEmit('contact deleted', {room:contact, contact:RESTapi.getUser()}); //Tell the contact to "status = 0" this user
            },
            (reason) => {}
        );
    };

    $scope.acceptContactRequest = function(index){
        //Update contact in the user database
        $scope.contacts[index].status = 300; //Request accepted
        let updateContact = {
            id: RESTapi.getUser(),
            contact: $scope.contacts[index]
        };
        RESTapi.insertUpdateContact(updateContact)
        .then(
            (response) => {},
            (reason) => {}
        );

        //Update user data in the contact database
        updateContact = {
            id: $scope.contacts[index].contactId,
            contact: {
                contactId: RESTapi.getUser(),
                username: RESTapi.getUsername(),
                viewname: RESTapi.getUsername(),
                profilePicture: RESTapi.getUserPicture(),
                status: 300
            }
        };
        RESTapi.insertUpdateContact(updateContact)
        .then(
            (response) => {
                RESTapi.ioEmit('accept request', {room:$scope.contacts[index].contactId, contact:RESTapi.getUser()});
            },
            (reason) => {}
        )
    };

    RESTapi.ioOn('request accepted', function(contact){
        for(let i in $scope.contacts){
            if($scope.contacts[i].contactId === contact){
                $timeout(function(){
                    $scope.contacts[i].status = 300;
                }, 0);
                break;
            }
        }
    });

    $scope.addContact = function(event){
        $mdDialog.show({
            controller: 'ContactDialogController',
            templateUrl: '../views/dialog/addUser.html',
            parent: angular.element(document.body),
            targetEvent: event
        })
            .then(
                (response) => {

                },
                (reason) => {

                }
            )
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
                .title('Do you want to change ' + $scope.contacts[index].viewname + ' username?')
                .placeholder('Username')
                .ariaLabel('Username')
                .initialValue($scope.contacts[index].viewname)
                .targetEvent(event)
                .ok('Change username')
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
                                .title('Contact Username Alert')
                                .textContent('Contacts must have a username')
                                .ariaLabel('Contacts must have a username')
                                .ok('Close')
                                .targetEvent(event)
                            );
                        }
                        //Modify the contact's username
                        else{
                            //Update contact viewname in the database
                            $scope.contacts[index].viewname = response;
                            let updateContact = {
                                id: RESTapi.getUser(),
                                contact: $scope.contacts[index]
                            };
                            RESTapi.insertUpdateContact(updateContact)
                            .then(
                                (response) => {
                                    $mdDialog.show(
                                        $mdDialog.alert()
                                        .parent(angular.element(document.body))
                                        .clickOutsideToClose(true)
                                        .title('Contact Username Changed')
                                        .textContent('Your viewname for ' + $scope.contacts[index].username + ' is now ' + $scope.contacts[index].viewname)
                                        .ariaLabel('Your viewname for ' + $scope.contacts[index].username + ' is now ' + $scope.contacts[index].viewname)
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

    $scope.goToChat = function(event, index, status){
        if(status < 300){
            //User have not been accepted yet by the contact
            if(status === 100){
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(true)
                    .title('Contact Alert')
                    .textContent($scope.contacts[index].viewname + ' has not accepted your Contact Request yet')
                    .ariaLabel($scope.contacts[index].viewname + ' has not accepted your Contact Request yet')
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
                    .textContent('Accept ' + $scope.contacts[index].viewname + '\'s Contact Request to chat')
                    .ariaLabel('Accept ' + $scope.contacts[index].viewname + '\'s Contact Request to chat')
                    .ok('Close')
                    .targetEvent(event)
                );
            }
            return;
        }

        //If status >= 300, create/open chat room
        RESTapi.createChatRoom([$scope.contacts[index].contactId, RESTapi.getUser()])
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
                        let config = { params: {} };
                        for(let i = 0, j = 1; i < 2; i++, j--){
                            config.params = {
                                contactFrom: $scope.currentChat.contacts[i],
                                contactTo: $scope.currentChat.contacts[j]
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
                        $scope.loadChat([$scope.contacts[index].contactId, RESTapi.getUser()], null);
                    }
                },
                (reason) => {}
            );

        //Move to chat menu
        $scope.selectedTab = 2;
    };

    let addChatToUsers = function(chatData){
        RESTapi.insertUserChat(chatData)
            .then(
                (response) => { //Response contains the chat information and each user contactId
                    //Launch a message to the all the users (including this) to update the view
                    RESTapi.ioEmit('chat room added', response);
                    if(response.id === RESTapi.getUser()){
                        //Join the newly created chat
                        RESTapi.ioEmit('join chat room', response.chat.chatId);
                    }
                },
                (reason) => {}
            );
    };

    RESTapi.ioOn('added new chat room', function(data){
        $timeout(function(){
            $scope.chats.push(data);
        }, 0);
    });

    $scope.loadChat = function(participants, id){
        //Access the intended chat
        let config = {
            params: {
                id: id,
                contacts: participants
            }
        };
        RESTapi.getChat(config)
            .then(
                (response) => {
                    //Set the found chat room as the current room
                    //TODO Maybe need to wrap the currentChat in a $timeout
                    if($scope.currentChat){
                        RESTapi.ioEmit('leave room', $scope.currentChat._id);
                    }
                    $scope.currentChat = response;
                    RESTapi.ioEmit('join chat room', response._id);
                },
                (reason) => {}
            );
    };

    RESTapi.ioOn('open chat', function(){
        openChat();
    });




    //CHATS MENU
    //Variables


    //Add chat
    let setCurrentChat = function(currChat){
        $scope.currentChat = currChat;
    };

    $scope.addChat = function(event){
        $mdDialog.show({
            controller: 'ChatDialogController',
            templateUrl: '../views/dialog/addChat.html',
            parent: angular.element(document.body),
            multiple: true,
            targetEvent: event,
            locals: {
                contactList: $scope.contacts,
                currentChat: $scope.currentChat,
                loadChat: $scope.loadChat,
                addChatToUsers: addChatToUsers,
                setCurrentChat: setCurrentChat
            }
        })
            .then(
                (response) => {

                },
                (reason) => {

                }
            )
    };



    //Remove chat
    //Contact remove function
    //TODO Refactor for chats
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
                        removeList.push($scope.chats[index].chatId);
                        updateOnDelete($scope.chats[index].chatId);

                    }
                    //Otherwise, a list of chats must exist
                    else{
                        for(let i in $scope.selectedContact){
                            if($scope.selectedContact[i]) {
                                removeList.push($scope.contacts[i].contactId);
                                $scope.contacts[i].status = 0;
                                updateOnDelete($scope.contacts[i].contactId);

                            }
                        }
                        $scope.selectedContact = []; //Clear the "checkbox" array
                    }

                    //If the remove list have elements, delete them from the database
                    if(removeList.length > 0){
                        config = {
                            params: {
                                userId: RESTapi.getUser(),
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

    RESTapi.ioOn('remove contact', function(contact){
        for(let i in $scope.contacts){
            if($scope.contacts[i].contactId === contact){
                $timeout(function(){
                    $scope.contacts[i].status = 0;
                    $scope.selectedContact[i] = false; //Clear the "checkbox" of the deleted item
                }, 0);
                break;
            }
        }
    });






    //TODO Open chat, final chat option, do it last
    let openChat = function(){
        console.log($scope.currentChat);
    };
}])

.controller("ContactDialogController",["$scope", "$q", "$mdDialog", "EMAIL_RE", "RESTapi", function($scope, $q, $mdDialog, EMAIL_RE, RESTapi){
    $scope.tags = [];
    let rejected = {
        notEmail: [],
        notFound: [],
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
                if(contact === RESTapi.getUserEmail()){
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
                            //Add the contact to the user
                            let addContact = {
                                id: RESTapi.getUser(),
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
                                        RESTapi.ioEmit('new contacts', contact['data']._id);
                                    }
                                );

                            //And add the user to the contact
                            addContact = {
                                id: contact['data']._id,
                                contact: {
                                    contactId: RESTapi.getUser(),
                                    username: RESTapi.getUsername(),
                                    viewname: RESTapi.getUsername(),
                                    profilePicture: RESTapi.getUserPicture(),
                                    status: 200
                                }
                            };
                            reqPromises.push(RESTapi.insertUpdateContact(addContact));
                        }
                        else{
                            rejected.notFound.push(contacts[index]);
                        }
                    });

                    //After all promises to the requester are fulfilled, load the contacts list
                    $q.all(reqPromises)
                        .then(
                            (response) => {
                                RESTapi.ioEmit('new contacts', RESTapi.getUser());
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

.controller("ChatDialogController", ["$scope", "$mdDialog", "RESTapi", "contactList", "currentChat", "loadChat", "addChatToUsers", "setCurrentChat", function(
    $scope,
    $mdDialog,
    RESTapi,
    contactList,
    currentChat,
    loadChat,
    addChatToUsers,
    setCurrentChat){

    $scope.contactList = contactList;
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
            contactIds.push(contactList[index].contactId);
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
            //TODO Create the chat
            //create the chat room
            RESTapi.createChatRoom([...contactIds, RESTapi.getUser()])
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
                            let config = { params: {} };
                            for(let i = 0, j = 1; i < 2; i++, j--){
                                config.params = {
                                    contactFrom: currentChat.contacts[i],
                                    contactTo: currentChat.contacts[j]
                                };
                                RESTapi.getUserContact(config)
                                .then(
                                    (response) => {
                                        let insertChat = {
                                            id: response._id,
                                            chat: {
                                                chatId: currentChat._id,
                                                chatname: response.contacts[0].viewname,
                                                chatPicture: response.contacts[0].profilePicture
                                            }
                                        };
                                        addChatToUsers(insertChat);
                                    }
                                )
                            }
                        }
                        //TODO Group chat
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
                        loadChat([...contactIds, RESTapi.getUser()], null);

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
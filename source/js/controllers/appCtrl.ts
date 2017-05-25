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

.controller("menuCtrl", ["$scope", "$http", "$timeout", "orderByFilter", "$location", "$q", "$mdDialog", "$mdMenu", "RESTapi", "EMAIL_RE", function(
    $scope:angular.IScope,
    $http:angular.IHttpService,
    $timeout:angular.ITimeoutService,
    orderBy:angular.IFilterOrderBy,
    $location:angular.ILocationService,
    $q:angular.IQService,
    $mdDialog,
    $mdMenu,
    RESTapi,
    EMAIL_RE
){
    //Variables
    $scope.remove = false;


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
    //Sorting elements. Receives a collection name, a field and a reverse sort boolean
    $scope.sortBy = function(collection, field, reverse){
        $scope[collection] = orderBy($scope[collection], field, reverse);
        $scope.remove = false;
    };

    //Toogles the multi remove button
    $scope.removeToggle = function(collection, event, value, del){
        $scope.remove = value;
        if(del){
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




    //CONTACTS
    $scope.selectContactToggle = function(index){
        $scope.selectedContact[index] = !$scope.selectedContact[index];
    };

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

                }
                //Otherwise, a list of contacts must exist
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

    //TODO Get the contact by index, go to the contact chat, put it on top and open it in the chat area
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

        console.log('go to chat with ' + $scope.contacts[index].contactId);
    }




    //CHATS MENU
    //Variables


    //Add chat
    //TODO Refactor for chats
    $scope.addChat = function(event){
        $mdDialog.show({
            controller: 'ChatDialogController',
            templateUrl: '../views/dialog/addChat.html',
            parent: angular.element(document.body),
            targetEvent: event,
            locals: {contactList: $scope.contacts}
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
    $scope.selectChatToggle = function(index){
        $scope.selectedContact[index] = !$scope.selectedContact[index];
    };

    $scope.removeChat = function(event, index){
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

                    }
                    //Otherwise, a list of contacts must exist
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


    //TODO Refactor for chats
    //Edit chat room
    $scope.editChatRoom = function(event, index){

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
    };



    //TODO Open chat, final chat option, do it last
    $scope.openChat = function(event, index){};
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

.controller("ChatDialogController", ["$scope", "$mdDialog", "contactList", function($scope, $mdDialog, contactList){
    $scope.contactList = contactList;
    let contactsSelected = []; //Contains the contacts indexes

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
        let i = contactsSelected.indexOf(index);
        if(i > -1){
            contactsSelected.splice(i, 1);
        }
        else{
            contactsSelected.push(index);
        }
    };

    $scope.exists = function(index){
        return contactsSelected.indexOf(index) > -1;
    };

    //Validate the adding contacts list and add them to the corresponding user
    /*$scope.validateAddContacts = function(ev){
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
     config.params = {
     searchBy: { email: contact },
     fields: 'email username profilePicture'
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
     };*/
}]);
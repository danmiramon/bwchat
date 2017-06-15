//move this folder to node_modules/@types/

declare namespace app{

    //Various types used usually within $scope

        //User Schema Type & Subtypes
    interface IAppUser{
        username:string;
        email:string;
        password:string;
        password2?:string;
        firstname?:string;
        lastname?:string;
        language?:string;
        profilePicture?:string;
        contacts?:IAppUserContact[];
        chats?:IAppUserChat[];
        _id?:string;
    }

    interface IAppUserContact{
        contactId:string;
        username:string;
        viewname:string;
        profilePicture:string;
        creatiionDate?:Date;
        status:number;
    }

    interface IAppUserChat{
        chatId:string|number;
        chatname:string;
        chatPicture:string;
        status?:number;
    }

    //Chat Schema Type & Subtypes
    interface IAppChat{
        groupRoom:boolean;
        contacts:string[];
        messages:IAppChatMessage[];
        _id?:string;
    }

    interface IAppChatMessage{
        user:string;
        text:string;
        image:boolean;
        date:Date;
    }

    interface IChatView{
        chatname:string;
        chatPicture:string;
        chatContactList:IChatContactList[]; //TODO mongoose ObjectId
        contactList:IChatContactList[]; //TODO mongoose ObjectId
    }

    interface IChatContactList{
        userId:string;
        username:string;
        profilePicture:string;
    }

    interface IChatMenu{
        tooltip:string;
        label:string;
        address:string;
    }

    interface IProfile{
        profilePicture:string;
        firstname:string;
        lastname:string;
        username:string;
        language:string;
    }

    interface IMessageUnit{
        user:string,
        username:string,
        profilePicture:string,
        text:string,
        image:boolean,
        date:Date
    }

    interface IRejected{
        notEmail:string[];
        notFound:string[];
        alreadyContact:string[];
        ownEmail:boolean;
    }




    //$scope typings
    interface IChatScope extends ng.IScope{
        error:string;
        user:IAppUser;
        chatView:IChatView;
        menus:IChatMenu[];
        remove:boolean;
        profile:IProfile;
        selectedPicture:number|string;
        showPics:boolean;
        profileImages:string[];
        currentChat:IAppChat;
        selectedTab:number;
        startIndex:number;
        canvasFlag:boolean;
        infiniteItems:any;
        png:string;
        messages:string;
        tags:string[];
        contactList:IAppUserContact[];
        contactsSelected:number[];
        groupPicture:number;
        groupPictures:string[];
        groupName:string;
        contacts:IAppUserContact[];
        removeContacts:IChatContactList[];

        keyPressLogin(event:KeyboardEvent, user:IAppUser):void;
        keyPressSignup(event:KeyboardEvent, user:IAppUser):void;
        login(user:IAppUser, errorFlag:boolean):void;
        signup(user:IAppUser):void;
        logout():void;
        showLogoutToast():void;
        dataLoad(menu:string):void;
        toggle(index:number):void;
        exists(index:number):boolean;
        removeToggle(collection:string, event:MouseEvent, value:boolean):void;
        removeContact(event:MouseEvent, index:number):void;
        removeChat(event:MouseEvent, index:number):void;
        sortBy(collection:string, field:string, reverse:boolean):void;
        selectPic(index:number):void;
        profileUpdate():void;
        addContact(event:MouseEvent):void;
        goToChat(event:MouseEvent, index:number, status:number):void;
        loadChat(participants:string[], id:string, privateChat:boolean):void;
        editViewName(event:MouseEvent, index:number, status:number):void;
        acceptContactRequest(index:number):void;
        addChat(event:MouseEvent):void;
        openCanvas():void;
        startDraw(event:MouseEvent):void;
        draw(event:MouseEvent):void;
        stopDraw(event:MouseEvent):void;
        setColor(color:string):void;
        removeChatContact(event:MouseEvent):void;
        shiftDown(event:KeyboardEvent):void;
        shiftUp(event:KeyboardEvent):void;
        keypressed(event:KeyboardEvent):void;
        broadcastMessage(event:KeyboardEvent):void;
        hide():void;
        cancel():void;
        answer(answer:string):void;
        validateAddContacts(ev:MouseEvent):void;
        isGroup():boolean;
        validateNewChat(ev:MouseEvent):void;
        validateNewChatContact(ev:MouseEvent):void;
        validateChatRemoveContact(ev:MouseEvent):void;
		onExit():void;
    }
}
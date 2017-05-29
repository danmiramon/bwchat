import * as mongoose from "mongoose";

//User list interface
 export interface IUserList extends mongoose.Document{
     userId: {type: mongoose.Schema.Types.ObjectId},
     username: {type: string},
     profilePicture: {type: string}
 }

 //Schema
let userListSchema: mongoose.Schema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    profilePicture: {
        type: String,
        default: 'img/profilePictures/bk.png'
    }
});

 export let UserList:mongoose.Model<IUserList> = mongoose.model<IUserList>('UserList', userListSchema);
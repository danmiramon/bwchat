import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt-nodejs";

//User interface
export interface IUser extends mongoose.Document{
    _id:mongoose.Schema.Types.ObjectId;
    username:string;
    password:string;
    firstname:string;
    lastname:string;
    email:string;
    language:string;
    profilePicture:string;

    generateHash(psw:string):string;
    validPassword(psw:string):boolean;
}


//Sub Schemas
let contact: mongoose.Schema = new mongoose.Schema({
    contactId:{type: mongoose.Schema.Types.ObjectId},
    viewName:{type: String},
    active:{type: Boolean}
});

let chat: mongoose.Schema = new mongoose.Schema({
    chatId:{type: mongoose.Schema.Types.ObjectId},
    active:{type: Boolean}
});


//Schemas
let userSchema: mongoose.Schema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username:String,
    password:String,
    firstname: {type: String},
    lastname: {type: String},
    email: {type: String},
    language: {
        type: String,
        default: 'en'
    },
    profilePicture: {type: String},
    contacts:{type: [contact]},
    chats:{type: [chat]}
});



//Schema methods
//Encrypt the password and return the result
userSchema.methods.generateHash = function(password:string):string{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

//Validate password
userSchema.methods.validPassword = function(password:string):boolean{
    return bcrypt.compareSync(password, this.password);
};

export let User:mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema);
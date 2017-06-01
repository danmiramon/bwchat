import * as mongoose from "mongoose";

//Chat interface
export interface IChat extends mongoose.Document{
    groupRoom: Boolean;
    contacts: mongoose.Schema.Types.ObjectId[];
}


//Sub Schemas
let message: mongoose.Schema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId},
    text:{type: String},
    date:{type:Date},
});


//Schemas
let chatSchema: mongoose.Schema = new mongoose.Schema({
    groupRoom: {type: Boolean},
    contacts: {type: [mongoose.Schema.Types.ObjectId]},
    messages:{type: [message]}
});

export let Chat:mongoose.Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);
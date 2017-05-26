import * as mongoose from "mongoose";

//Chat interface
export interface IChat extends mongoose.Document{
    contacts: mongoose.Schema.Types.ObjectId[];
}

//Sub Schemas
let message: mongoose.Schema = new mongoose.Schema({
    text:{type: String},
    canvas:{type:String},
    user:{type:mongoose.Schema.Types.ObjectId},
    date:{type:Date},
    active:{type: Boolean}
});


//Schemas
let chatSchema: mongoose.Schema = new mongoose.Schema({
    contacts: {type: [mongoose.Schema.Types.ObjectId]},
    messages:{type: [message]}
});

export let Chat:mongoose.Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);
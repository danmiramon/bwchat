import * as mongoose from "mongoose";

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
    name: {
        type: String,
        default: 'chat'
    },
    participants: {type: [mongoose.Schema.Types.ObjectId]},
    groupImage: {type:String},
    messages:[message]
});

export let Chat:mongoose.Model<mongoose.Document> = mongoose.model('Chat', chatSchema);
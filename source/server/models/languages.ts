import * as mongoose from "mongoose";

let languageSchema:mongoose.Schema = new mongoose.Schema({
    language:String
});

export let Language:mongoose.Model<mongoose.Document> = mongoose.model('Language', languageSchema);
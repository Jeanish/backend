import {mongoose , Schema} from "mongoose"
const likeScheme = new Schema({
    likeOnVideo:{
        type:Number,
        default: 0
    },
    likeOnComment:{
        type:Number,
        default: 0
    },
})


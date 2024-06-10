import mongoose,{Schema} from "mongoose";
// import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2' //1-step

const commentSchema = new Schema({
    comment:{
        type:String,

    },
    comment_owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    likes:{
        type:Number,
        default:0
    },

},{
    timestamps:true
})

export const comment = mongoose.model("Comment",commentSchema)
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectionInstance)
        console.log(`\n MongoDb is connnected !! DB HOST: ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("Mongodb connected error", error);
        process.aexit(1);
    }
}

export default connectDB
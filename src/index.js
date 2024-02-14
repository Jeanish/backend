
//-----------------2nd method---------------------
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on  localhost:${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("mongodb connection error",error);
})




// -----------------1st method

// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';

// import express from 'express'
// const app = express()

// ;(async ()=>{
//     try{
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("error : ",error);
//             throw error;
//         })

//         app.listen(process.env.PORT,() => {
//             console.log('app is listening ');
//         })

//     }catch(error){
//         console.error("error : ",error);
//         throw error;

//     }
// })()
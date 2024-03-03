import express from "express";  
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public")) //public is only folder name
app.use(cookieParser()) //for secure crud operation

//(err,req,res,next) => total 4 parameter is there .
//if you are using next() then you are talkin' about middleware function.
//next() is a flag 


//routes
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)  //user became prefix  // and manchaha naaam tabhi de sakte hai jab export default huwa ho

export default app
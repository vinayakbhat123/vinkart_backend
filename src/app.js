const express = require("express");
const connectDB = require("./database/db");
const { authRouter } = require("./routes/auth");
const {userRouter} = require("./routes/user")
const {productRouter} = require("./routes/product")
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config()
const app = express();
const PORT = process.env.PORT || 3000
// middleware
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(express.json())
app.use(cookieParser());   // must be before routes

app.use("/",authRouter)
app.use("/",userRouter)
app.use("/",productRouter)


connectDB()
.then(() => {
    console.log("Database connected succesfully")
    app.listen(PORT, () => {
          console.log(`server is listening at port:${PORT}`)
   })
})
.catch((error) => {
    console.log("ERROR:",error)

})

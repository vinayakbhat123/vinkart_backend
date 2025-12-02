const express = require("express");
const connectDB = require("./database/db");
const { authRouter } = require("./routes/auth");
require("dotenv").config()
const app = express();
const PORT = process.env.PORT || 3000
// middleware
app.use(express.json())
app.use("/",authRouter)

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

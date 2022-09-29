const express = require('express')
const route = require('./routers/route')
const mongoose = require('mongoose')
const app = express()

app.use(express.json())

mongoose.connect("mongodb+srv://aleshasayyad:*****@cluster0.him7s8k.mongodb.net/group44Database" ,
{ useNewUrlParser: true}
)
.then(() => console.log("Mongodb is connected"))
.catch((err) => console.log(err))

app.use('/', route)

app.listen(process.env.PORT || 3000, function() {
    console.log("Express app running on PORT" + " " + (process.env.PORT || 3000))
})


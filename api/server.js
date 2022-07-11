const express = require('express'); 
// const bodyParser = require('body-parser')
require('dotenv').config({path: './config/.env'});
require('./config/db')
const app = express()
// const userRoutes = require('./routes/user.routes.js')

const userRoute = require("./routes/user.routes");
const postRoute = require("./routes/post.routes");








// app.use('/api/user', userRoutes)



//middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({extended: true}))

// routes
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);




// server
app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
})
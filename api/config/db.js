const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://" + process.env.DB_USER_PASS + "@mernsocialmedia.8jfmq.mongodb.net/mern-project",
    {
      useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   useCreateIndex: true,
    //   useFindAndmodify: false,
    }
  )
  .then(() => console.log("connected to mongoBD"))
  .catch((err) => console.log("failed to connected to mongoDB", err));

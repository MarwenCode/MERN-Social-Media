const User = require("../models/user.model");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { json } = require("body-parser");
const ObjectID = require("mongoose").Types.ObjectId;
const jwt = require('jsonwebtoken')

const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const multer = require("multer");
const upload = multer();




const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
  return jwt.sign({id}, process.env.TOKEN_SECRET, {
    expiresIn: maxAge
  })
};

// register
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      pseudo: req.body.pseudo,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(400).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password");
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge});

    return res.status(200).json({ user: user._id});
  } catch (error) {
    console.log(error);
  }
});

// logout
router.get("/logout", async (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect("/");
});

// get all users
router.get("/", async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

//get user info
router.get("/:id", async (req, res) => {
  console.log(req.params);
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID is unknown : " + req.params.id);
  } else {
    User.findById(req.params.id, (err, docs) => {
      if (!err) res.send(docs);
      else console.log("ID unknown : " + err);
    }).select("-password");
  }
});

// update user
router.put("/:id", async (req, res) => {
  console.log(req.body);
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID is unknown : " + req.params.id);
  }
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).send({ message: "user updated" }).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID is unknown : " + req.params.id);
  }
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
 
});

// follow a user
router.put("/follow/:id", async(req, res) => {
  if (req.body.userId !== req.params.id) {

    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if(!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers : req.body.userId }});
        await currentUser.updateOne({ $push: { following : req.params.id}})
        res.status(200).json("user has been followed")
      }else {
        res.status(403).json("you allready follow this user")
      }
      
    } catch (error) {
      res.status(500).json(error);
      
    }

  } else {
    res.status(403).json("you cant follow yourself");

  }

})
// unfollow a user
router.put("/unfollow/:id", async(req, res) => {
  if (req.body.userId !== req.params.id) {

    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if(user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers : req.body.userId }});
        await currentUser.updateOne({ $pull: { following : req.params.id}})
        res.status(200).json("user has been unfollowed")
      }else {
        res.status(403).json("you dont follow this user")
      }
      
    } catch (error) {
      res.status(500).json(err);
      
    }

  } else {
    res.status(403).json("you cant unfollow yourself");

  }
 

});

//upload a profile picture 
router.post("/upload",upload.single("file"), async (req, res) => {
  try {
    if (
      req.file.detectedMimeType != "image/jpg" &&
      req.file.detectedMimeType != "image/png" &&
      req.file.detectedMimeType != "image/jpeg"
    )
      throw Error("invalid file");

    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    // const errors = uploadErrors(err);
    return res.status(201).json(err);
  }
  const fileName = req.body.name + ".jpg";

  await pipeline(
    req.file.stream,
    fs.createWriteStream(
      `${__dirname}/.../client/public/uploads/profil/${fileName}`
      // `${__dirname}/../client/public/uploads/profil/${fileName}`
      // `${__dirname}/./client/public/uploads/profil/${fileName}`
    )
  );

  try {
    await User.findByIdAndUpdate(
      req.body.userId,
      { $set : {picture: "./uploads/profil/" + fileName}},
      { new: true, upsert: true, setDefaultsOnInsert: true},
      (err, docs) => {
        if (!err) return res.send(docs);
        else return res.status(500).send(err);
      }
    );
  } catch (err) {
    return res.status(500).send(err);
  }

});






module.exports = router;

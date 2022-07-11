// // const postModel = require("../models/post.model")
// const Post = require("../models/post.model");
// const User = require("../models/user.model");

// const ObjectID = require("mongoose").Types.ObjectId;

// // const router = require("express").Router();



// //like a post

// module.exports.likePost = async (req, res) => {
   
//     if (!ObjectID.isValid(req.params.id))
//       return res.status(400).send("ID unknown : " + req.params.id);
  
//     try {
//       await Post.findByIdAndUpdate(
//         req.params.id,
//         {
//           $addToSet: { likers: req.body.id },
//         },
//         { new: true },
//         (err, docs) => {
//           if (err) return res.status(400).send(err);
//         }
//       );
//       await User.findByIdAndUpdate(
//         req.body.id,
//         {
//           $addToSet: { likes: req.params.id },
//         },
//         { new: true },
//         (err, docs) => {
//           if (!err) res.send(docs);
//           else return res.status(400).send(err);
//         }
//       );
//     } catch (err) {
//       return res.status(400).send(err);
//     }

   
//   };
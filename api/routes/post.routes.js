const router = require("express").Router();
const Post = require("../models/post.model");
const User = require("../models/user.model");
const multer = require("multer");
const upload = multer();
const ObjectID = require("mongoose").Types.ObjectId;


// read a post

router.get("/", async (req, res) => {
  Post.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get data : " + err);
  }).sort({ createdAt: -1 });
});

//creat a post

router.post("/", async (req, res) => {
  const newPost = new Post({
    posterId: req.body.posterId,
    message: req.body.message,
    // picture: req.file !== null ? "./uploads/posts/" + fileName : "",
    video: req.body.video,
    likers: [],
    comments: [],
  });
  // const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (error) {
    return res.status(400).send(error);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const post = await Post.findById(req.params.id);
  if (post.posterId === req.body.posterId) {
    await post.updateOne({ $set: req.body });
    res.status(200).json("the post has been updated");
  } else {
    res.status(403).json("you can update only your post");
  }
});

//delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if ((post.posterId = req.params.id)) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// like unlike a post

router.put("/like-post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // const user = await User.findById(req.params.id);
    if (!post.likers.includes(req.body.id)) {
      await post.updateOne({ $push: { likers: req.body.id } });
      // await user.updateOne({ $push: { likes: req.body.id } });

      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likers: req.body.id } });
      // await user.updateOne({ $pull: { likes: req.body.id } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//add comment
router.patch('/comment-post/:id', async(req, res) => {
  if (!ObjectID.isValid(req.params.id))
  return res.status(400).send("ID unknown : " + req.params.id);

try {
   Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        comments: {
          commenterId: req.body.commenterId,
          commenterPseudo: req.body.commenterPseudo,
          text: req.body.text,
          timestamp: new Date().getTime(),
        },
      },
    },
    { new: true },
    (err, docs) => {
      if (!err) return res.send(docs);
      else return res.status(400).send(err);
    }
  );
} catch (err) {
  return res.status(400).send(err);
}

})

// edit comment 
router.patch('/edit-comment-post/:id', async(req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // Post.findById(req.params.id, (err, docs) => {
    //   const theComment = docs.comments.find((comment) =>
    //     comment._id = req.body.commentId
    //   );
    //   console.log(Post)

    //   if (!theComment) return res.status(404).send("Comment not found");
    //   theComment.text = req.body.text;

    //   return docs.save((err) => {
    //     if (!err) return res.status(200).send(docs);
    //     return res.status(500).send(err);
    //   });
    // });

    Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          
          }
        }
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        else return res.status(400).send(err);
      }
    )


  } catch (err) {
    return res.status(400).send(err);
  }
})

//delete comment
router.delete('/delete-comment-post/:id', async(req, res) => {
  if (!ObjectID.isValid(req.params.id))
  return res.status(400).send("ID unknown : " + req.params.id);

  try {
    Post.findByIdAndUpdate(
      req.params.id, {
        $pull: {
          comments: {
            _id: req.body.commentId
          }
        }
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.status(200).json("comment deleted");
      
        else return res.status(400).send(err);
      }
    )
    
  } catch (error) {
    return res.status(400).send(err);
    
  }

})



module.exports = router;

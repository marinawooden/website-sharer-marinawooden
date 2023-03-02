import express from 'express';
let router = express.Router();

router.get("/", async (req, res) => {
  try {
    let allComments = await req.models.Comments.find({
      "post": req.query.postID
    });

    res.json(allComments);
  } catch (err) {
    res.status(500).send({
      "status": "error",
      "error": err
    })
  }
});

router.post("/", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      let newComment = new req.models.Comments({
        "username": req.session.username,
        "comment": req.body.newComment,
        "post": req.body.postID
      });
  
      await newComment.save();
      res.json({
        "status": "success"
      })
    } catch (err) {
      res.status(500).json({
        "status": "error",
        "error": err
      });
    }
  } else {
    res.status(401).json({
      "status": "error",
      "error": "not logged in"
    })
  }
});

export default router;
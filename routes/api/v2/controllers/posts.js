import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

/** Uploads a post based on user-specified information */
router.post("/", async (req, res) => {
  if (req.body && req.body.description && req.body.poster) {
    try {
      let post = new req.models.Post({
        "url": req.body["url"],
        "description": req.body["description"],
        "poster": req.body["poster"]
      });

      await post.save();

      res.json({
        "status": "success"
      })
    } catch (err) {
      console.log(err);
      res.status(500).json({
        "status": "error",
        "error": "There was an error on the server"
      });
    }
  } else {
    res.status(400).json({
      "status": "error",
      "error": "Please provide all required input!"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    let postData = await req.models.Post.find({});
    postData = await Promise.all(
      postData.map(async (post) => { 
        let webPreview = await getURLPreview(post["url"]);

        return ({
          "description": post["description"],
          "poster": post["poster"],
          "htmlPreview": webPreview,
        });
      })
    );

    res.json(postData);
  } catch (err) {
    res.status(500).json({
      "status": "error",
      "error": "There was an error on the server"
    });
  }
});

export default router;
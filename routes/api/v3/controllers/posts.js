import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

/** Uploads a post based on user-specified information */
router.post("/", async (req, res) => {
  if (req.session.isAuthenticated) {
    if (req.body && req.body.description) {
      try {
        let post = new req.models.Post({
          "url": req.body["url"],
          "description": req.body["description"],
          "username": req.session.account.username,
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
  } else {
    res.status(401).json({
      "status": "error",
      "error": "not logged in"
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
          "username": post["username"],
          "htmlPreview": webPreview,
          "id": post["_id"],
          "created_date": new Date(post["created_date"]).toLocaleString(),
          "likes": post["likes"]
        });
      })
    );

    res.json(postData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      "status": "error",
      "error": "There was an error on the server"
    });
  }
});

router.post("/like", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      let postData = await req.models.Post.findById(req.body.postID);
      console.log(postData);
      if (!postData.likes.includes(req.session.account.username)) {
        postData.likes.push(req.session.account.username);
        await postData.save();
      }

      res.json({
        "status": "success"
      });
    } catch (err) {
      res.status(500).json({
        "status": "error",
        "error": err
      })
    }
  } else {
    res.status(401).json({
      "status": "error",
      "error": "not logged in"
    })
  }
});

router.post("/unlike", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      let postData = await req.models.Post.findById(req.body.postID);
      if (postData.likes.includes(req.session.account.username)) {
        postData.likes = removeFromArray(postData.likes, req.session.account.username);
        await postData.save();
      }

      console.log(postData);

      res.json({
        "status": "success"
      });
    } catch (err) {
      res.status(500).json({
        "status": "error",
        "error": err
      })
    }
  } else {
    res.status(401).json({
      "status": "error",
      "error": "not logged in"
    })
  }
});

router.delete("/", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      let postData = await req.models.Post.findById(req.body.postID);
      if (postData.username !== req.session.account.username) {
        res.status(401).json({
          "status": "error",
          "error": "you can only delete your own posts"
       });
      } else {
        await req.models.Comments.deleteMany({
          "post": postData.id
        });

        return res.json({
          "status": "success"
        })
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        "status": "error",
        "error": err
      })
    }
  } else {
    res.status(401).json({
      "status": "error",
      "error": "not logged in"
    });
  }
});

function removeFromArray(arr, value) {
  const index = arr.indexOf(value);
  if (index > -1) { // only splice array when item is found
    arr.splice(index, 1); // 2nd parameter means remove one item only
  }
  return arr;
}

export default router;
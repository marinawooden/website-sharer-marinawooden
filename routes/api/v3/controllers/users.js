

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get('/myIdentity', function(req, res, next) {
  if(req.session && req.session.isAuthenticated){
    res.json({
      status: "loggedin", 
      userInfo: {
         name: req.session.username, 
         username: req.session.username}
    })
  } else {
    res.json( { status: "loggedout" })
  }
});

router.get("/:userid/info", async (req, res) => {
  try {
    let userInfo = await req.models.Users.findOne({
      "email": req.params["userid"]
    });
    // impossible- but I want to be safe
    if (!userInfo) {
      res.json({});
    } else {
      res.json(userInfo["favorites"]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).type('text').send("Server error");
  }
});

router.post("/me/update", async (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    try {
      let myUserInfo = await req.models.Users.findOne({
        "email": req.session["username"]
      })

      if (myUserInfo) {
        myUserInfo["favorites"]["website"] = req.body["favorites"]["website"] ? req.body["favorites"]["website"] : myUserInfo["favorites"]["website"];
        myUserInfo["favorites"]["npm-package"] = req.body["favorites"]["npm-package"] ? req.body["favorites"]["npm-package"] : myUserInfo["favorites"]["npm-package"];
        myUserInfo["favorites"]["database"] = req.body["favorites"]["database"] ? req.body["favorites"]["database"] : myUserInfo["favorites"]["database"];
      } else {
        myUserInfo = new req.models.Users({
          "email": req.session["username"],
          "favorites": req.body["favorites"]
        })
      }

      await myUserInfo.save();
      res.type('text').send('success!');
    } catch (err) {
      console.log(err);
      res.status(500).type('text').send("Server error");
    }
  } else {
    res.status(400).type('text').send("You aren't logged in somehow");
  }
});

export default router;
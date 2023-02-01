import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

/** Sends back a preview of the user-provided website */
router.get("/preview", async (req, res) => {
  if (req.query["url"]) {
    try {
      let webpageData = await getURLPreview(req.query["url"]);
      res.type("html").send(webpageData);
    } catch (err) {
      res.type("text").status(500).send("There was an error on the server.");
    }
  } else {
    res.type("text").status(400).send("Please provide all necessary input!");
  }
});

export default router;
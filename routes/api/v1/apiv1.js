import express from 'express';
import fetch from 'node-fetch';
import parser from "node-html-parser";

const router = express.Router();

router.get("/urls/preview", async (req, res) => {
  if (req.query["url"]) {
    let url = req.query["url"];
    try {
      let data = await fetch(url);
      await statusCheck(data);
      data = await data.text();

      data = processAsHTML(data, url);
      res.type("html").send(data);
    } catch (err) {
      console.error(err);
      res.type("text").status(500).send("An error occured on the server.");
    }
  } else {
    res.type("text").status(400).send("Please provide a URL!")
  }
});

function processAsHTML(data, url) {
  let webpageData = parser.parse(data);

  // get all the meta tags with property
  let typeMap = {};
  let metaTags = webpageData.querySelectorAll("meta[property]");
  metaTags.filter((e) => {
    return (/^og:/g).test(e.attributes.property)
  }).forEach((e) => {
    typeMap[e.attributes.property] = e.attributes.content;
  });

  console.log(typeMap);

  let template = `
    <div style="width:100%;max-width:500px;margin:1em;padding:1em;border: 1px solid #00000029;border-radius: 4px;box-shadow: 0 0 10px #0000001a;text-align:center">
      <a href="${typeMap["og:url"] ? typeMap["og:url"] : url}">
         <h1>${typeMap["og:site_name"] ? typeMap["og:site_name"] : webpageData.querySelector("title").textContent}</h1>
      </a>
      ${typeMap["og:title"] ? '<h2>' + typeMap["og:title"] + '</h2>' : ""}
      <img style="display:block;margin:0 auto;max-height: 200px; max-width: 270px;" src="${typeMap["og:image"] ? typeMap["og:image"] : "https://pbs.twimg.com/profile_images/425274582581264384/X3QXBN8C.jpeg"}" alt="${typeMap["og:title"] ? typeMap["og:title"] : 'Logo for unknown site'}">
      ${typeMap["og:type"] ? '<p style="color:grey"><small>' + typeMap["og:type"] + '</small></p>' : ""}
      ${typeMap["og:description"] ? '<p>' + typeMap["og:description"] + '</p>' : "This website has no open-graph information"}
    </div>
  `;

  return template;
}

/**
 * Checks the status code of a response to see if no error
 * occurred.
 * @param {Promise} res - the response from the server
 */
async function statusCheck(res) {
  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res;
}

export default router;
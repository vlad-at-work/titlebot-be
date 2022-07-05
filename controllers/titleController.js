import puppeteer from "puppeteer";

// Make sure the URL at least is a URL, kind of important
function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

// This is our express route handler. Checks if the POSTed URL is valid,
// then defines puppeteer instance to launch a browser/page and use the url with goto.
// Title is pulled via page.title, however see below for favicon.
export const titleController = async (req, res) => {
  if (isValidHttpUrl(req.body.url)) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(req.body.url);
      const title = await page.title();
      const favicon = await findBestFaviconURL(page, req.body.url);
      res.status(200).send({ title, favicon });
      return;
    } catch (error) {
      res.status(500).send({ msg: error.message });
      return;
    }
  }
  res.status(400).send({ error: "invalid URL" });
};

// Grabbing a favicon is trickier; there are multiple ways a favicon can be designated in a
// document. This function essentially tries multiple selectors and if that fails,
// falls back to a root URL + /favicon which is oftentimes where they are found if not
// specifically noted in the document.
const findBestFaviconURL = async function (page, pageUrl) {
  const rootUrl = new URL(pageUrl).protocol + "//" + new URL(pageUrl).host;
  const selectorsToTry = [`link[rel="icon"]`, `link[rel="shortcut icon"]`];

  let faviconUrlFromDocument = null;

  // try selectors
  for (let i = 0; i < selectorsToTry.length; i++) {
    const href = await getDOMElementHRef(page, selectorsToTry[i]);
    if (typeof href === "undefined" || href === null || href.length === 0) {
      continue;
    }

    faviconUrlFromDocument = href;
    break;
  }

  // No favicon link found in document, best URL is likley favicon.ico at root
  if (faviconUrlFromDocument === null) {
    return rootUrl + "/favicon.ico";
  }

  if (
    faviconUrlFromDocument.substr(0, 4) === "http" ||
    faviconUrlFromDocument.substr(0, 2) === "//"
  ) {
    // absolute url
    return faviconUrlFromDocument;
  } else if (faviconUrlFromDocument.substr(0, 1) === "/") {
    // favicon relative to root
    return rootUrl + faviconUrlFromDocument;
  } else {
    // favicon relative to current (pageUrl) URL
    return pageUrl + "/" + faviconUrlFromDocument;
  }
};

// This is just a helper to grab stuff from the page
// for puppeteer
const getDOMElementHRef = async function (page, query) {
  return await page.evaluate((q) => {
    const elem = document.querySelector(q);
    if (elem) {
      return elem.getAttribute("href") || "";
    } else {
      return "";
    }
  }, query);
};

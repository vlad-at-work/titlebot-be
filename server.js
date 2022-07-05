import express from "express";
import { Server } from "http";
import compression from "compression";
import { base as baseScrapeRouter } from "./routers/baseScrapeRouter.js";
import allowCrossDomain from "./middleware/allowCrossDomain.js";

// process.env.PORT is handy dandy for launching from commandline
// as well as heroku which assigns ports randomly
const PORT = process.env.PORT || 8080;

// Fire up the express server
export const app = express();
export const httpServer = new Server(app);
const server = httpServer.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Server listening on ${port}`);
});

// Configure express server
app.use(allowCrossDomain);
app.use(compression());
app.use(express.static("views"));
// app.set('views', './views'); // stub in case we need views
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Apply the /title route handler to return scrape results
app.use(baseScrapeRouter);

require("dotenv").config();
console.log(process.env.MESSAGE);

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const EventEmitter = require("events");


// Create an HTTP server with Express
const app = express();
const server = http.createServer(app);



// Set Env File
const dotenv = require("@dotenvx/dotenvx");
dotenv.config({ path: "./.env", envKeysFile: './.env.keys' });



// Enable the server to parse requests with JSON payloads.
app.use(express.json());



// Set cors
var corsOptions = {
  origin: "http://localhost:8081",
  optionsSuccessStatus: 200,
};
app.use(cors());



// Set Headers
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "prefetch-src": ["'self'"],
        "font-src": ["'self'"],
        "style-src": ["'self'"],
        "script-src": ["'self'"],
        "img-src": ["'self'"],
        "media-src": ["'self'"],
        "connect-src": ["'self'"],
        "form-action": ["'self'"],
        "object-src": ["'self'"],
        "frame-src": ["'self'"],
        "worker-src": ["'self'"],
        "manifest-src": ["'self'"],
        "frame-ancestors": ["'self'"],
        "script-src-attr": ["'self'"],
      },
    },
    strictTransportSecurity: {
      maxAge: 63072000,
      preload: true,
    },
    referrerPolicy: {
      policy: "no-referrer",
    },
    xPoweredBy: false,
    xFrameOptions: { action: "DENY" },
    xDownloadOptions: false,
    xDnsPrefetchControl: { allow: true },
  })
);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});



// Set Routes
const routes = require("../src/routes/app");
app.use("/rest2", routes);



// Run After App Starts
const emitter = new EventEmitter();
emitter.on("appStarted", async () => {
 
});



const PORT = 8081;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  emitter.emit('appStarted');
});
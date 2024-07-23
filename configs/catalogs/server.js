const { spawn } = require("child_process");
const http = require("http");
const express = require("express");
const path = require("path");
const logger = require("./system-settings/console/console-logger.js");
const config = require("./../../config.json");
const axios = require('axios');
const port = process.env.PORT || config.ports;  // Use environment variable PORT if available
const app = express();
const httpServer = http.createServer(app);
const botStartTime = Date.now();

app.get("/dash", (req, res) => {
  const uptime = Date.now() - botStartTime;
  res.json({ uptime });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '/web/index.html'));
});

app.listen(port, () => logger(`Your app is listening at http://localhost:${port}`, "[ ONLINE ]"));

function startBot(message) {
  if (message) logger(message, "[ Starting ]");

  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "system.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", codeExit => {
    if (codeExit!== 0 || (global.countRestart && global.countRestart < 5)) {
      global.countRestart = (global.countRestart || 0) + 1;
      startBot("Restarting bot...");
    }
  });

  child.on("error", error => logger("An error occurred: " + JSON.stringify(error), "[ Starting ]"));
}

const data = { username: config.username, key: config.key };

logger("Authenticating... Please wait.", "[ AUTHENTICATING ]");

axios.post(global.api.approval+'/api/verify', data)
 .then(response => {
    if (response.data.valid) {
      logger("Authentication successful!", "[ AUTHENTICATED ]");
      startBot();
    } else {
      logger("Authentication unsuccessful please visit https://syntic-77bw.onrender.com to request a key and wait for approval or its either contact the developer(https://m.me/learnfromber)!", "[ FAILED ]");
    }
  })
 .catch(error => {
    console.error(error);
  });

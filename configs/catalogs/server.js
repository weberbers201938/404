const fs = require('fs');
const path = require('path');
const freeport = require('freeport');
const ProxyChain = require('proxy-chain');
const puppeteer = require('puppeteer-core');
const { exec, spawn } = require('node:child_process');
const { promisify } = require('node:util');
const http = require("http");
const express = require("express");
const axios = require('axios');
const logger = require("./system-settings/console/console-logger.js");
const config = require("./../../config.json");
//const api = require("./apis/api.json");
const screenshotPath = path.join(__dirname, 'screenshot.jpg');
const port = process.env.PORT || config.ports;  // Use environment variable PORT if available
const currentUrl = `https://replit.com/@${process.env.REPL_OWNER}/${process.env.REPL_SLUG}`;
const app = express();
const httpServer = http.createServer(app);
const botStartTime = Date.now();

let browser, page, newTab;

async function run() {
  freeport(async (err, proxyPort) => {
    if (err) {
      console.error('Error finding free port:', err);
      return;
    }

    const proxyServer = new ProxyChain.Server({ port: proxyPort });

    proxyServer.listen(async () => {
      const { stdout: chromiumPath } = await promisify(exec)("which chromium");

      browser = await puppeteer.launch({
        headless: false,
        executablePath: chromiumPath.trim(),
        ignoreHTTPSErrors: true,
        args: [
          '--ignore-certificate-errors',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          `--proxy-server=127.0.0.1:${proxyPort}`
        ]
      });

      page = await browser.newPage();
      await page.setUserAgent("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7; en-us) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Safari/530.17");

      const cookies = JSON.parse(fs.readFileSync('replit.json', 'utf8'));
      await page.setCookie(...cookies);

      await page.goto(currentUrl, { waitUntil: 'networkidle2' });

      newTab = await browser.newPage();
      await newTab.setUserAgent("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7; en-us) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Safari/530.17");
      await newTab.setCookie(...cookies);
      await newTab.goto(currentUrl, { waitUntil: 'networkidle2' });

      await page.screenshot({ path: screenshotPath, type: 'jpeg' });

      console.log('Browser is running. Press Ctrl+C to exit.');
      startBot();
    });
  });
}

function startBot(message) {
  if (message) logger(message, "[ Starting ]");

  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "system.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", codeExit => {
    if (codeExit !== 0 || (global.countRestart && global.countRestart < 5)) {
      global.countRestart = (global.countRestart || 0) + 1;
      startBot("Restarting bot...");
    }
  });

  child.on("error", error => logger("An error occurred: " + JSON.stringify(error), "[ Starting ]"));
}

app.get("/dash", (req, res) => {
  const uptime = Date.now() - botStartTime;
  res.json({ uptime });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '/web/index.html'));
});

app.listen(port, () => logger(`Your app is listening at http://localhost:${port}`, "[ ONLINE ]"));

// Uncomment and configure the following if you need authentication logic
/*
const data = { username: config.username, key: config.key };

logger("Authenticating... Please wait.", "[ AUTHENTICATING ]");

axios.post(`${api.approval}/api/verify`, data)
  .then(response => {
    if (response.data.valid) {
      logger("Authentication successful!", "[ AUTHENTICATED ]");
      startBot();
    } else {
      logger("Authentication unsuccessful. Please visit https://syntic-77bw.onrender.com to request a key and wait for approval or contact the developer (https://m.me/learnfromber)!", "[ FAILED ]");
    }
  })
  .catch(error => {
    console.error(error);
  });
*/

run();

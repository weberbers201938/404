const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "restart",
 version: "1.0.0",
 hasPermission: 2,
 credits: "Developer",
 description: "Restart AI",
 usePrefix: false,
 commandCategory: "no prefix",
 usage: "rs",
 cooldowns: 3,
 },

 run: async function({ api, event }) {
 try {
 const info = await api.sendMessage('Restarting...', event.threadID);
 const dataPath = path.join(__dirname, 'tmp', 'res.json');
 await fs.ensureDir(path.dirname(dataPath));
 await fs.writeFile(dataPath, JSON.stringify({ threadID: event.threadID }));
 process.exit(2);
 } catch (error) {
 console.error(`Error in restart command: ${error.message}`);
 api.sendMessage(`Error: ${error.message}`, event.threadID);
 }
 },

 onLoad: async function({ api }) {
 try {
 const dataPath = path.join(__dirname, 'tmp', 'res.json');
 if (await fs.pathExists(dataPath)) {
 const info = await fs.readJSON(dataPath);
 await api.sendMessage('Restarted!!', info.threadID);
 await fs.remove(dataPath);
 }
 } catch (error) {
 console.error(`Error in onLoad function: ${error.message}`);
 }
 },
};

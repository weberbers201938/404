module.exports = {
 config: {
 name: "rsql",
 version: "7.0.0",
 hasPermssion: 2,
 credits: "Developer",
 usePrefix: false,
 description: "Reset database",
 commandCategory: "no prefix",
 usages: "[shell]",
 cooldowns: 0,
 dependencies: {
 "child_process": "",
 "process": ""
 }
},
async run({ api, event, args }) {
 const { exec } = require("child_process");
 const process = require("process");
 const { threadID, messageID } = event;
 
 exec('rm -rf ../../database.sqlite', (error, stdout, stderr) => {
 if (error) {
 api.sendMessage(`Error: ${error.message}`, threadID, messageID);
 return;
 }
 if (stderr) {
 api.sendMessage(`stderr: ${stderr}`, threadID, messageID);
 return;
 }
 api.sendMessage(`🟣 Database successfully reset. Restarting the bot...`, threadID, (err, info) => {
 setTimeout(() => {
 process.exit(1);
 }, 1000);
 });
 });
 }
};

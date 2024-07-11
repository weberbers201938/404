module.exports = {
 config: {
 name: "admin",
 version: "1.0.0",
 hasPermssion: 2,
 credits: "Developer",
 description: "admincmd",
 usage: "[name of cmd] [query]",
 usePrefix: false,
 commandCategory: "System ",
 cooldowns: 0
 },

 async run({
 message, args,
 api, event,
 fonts
 }) {
 const fs = require("fs-extra");
 const path = require("path");
 const configPath = path.join(
 __dirname, "/../../", "config.json"
 );
 const configData = fs.readFileSync(configPath);
 const config = JSON.parse(configData);
 const input = args[0]?.toLowerCase();
 
 switch (input) {
 case "list":
 const botAdmins = config.ADMINBOT;
 let listMessage = `👑 | ${fonts.bold("Bot Admins")}
━━━━━━━━━━━━━━━
`;
 for (const adminId of botAdmins) {
 const userInfo = await api.getUserInfo(adminId);
 const adminName = userInfo[adminId]?.name || "Unknown";
 listMessage += `➤ ${adminName}\n`;
 };
 message.reply(listMessage);
 break;
 case "add":
 if (!event.messageReply) {
 message.reply(`❌ | ${fonts.bold("Error")}
━━━━━━━━━━━━━━━
Reply to user that you want to add as admin!`);
 } else {
 const id = event.messageReply.senderID;
 if (id) {
 if (!config.ADMINBOT.includes(id)) {
 config.ADMINBOT.push(id);
 fs.writeJSONSync(configPath, config);
 message.reply(`✅ | ${fonts.bold("Admin Added!")}
━━━━━━━━━━━━━━━
Added admin successfully!`);
 } else {
 message.reply(`❌ | ${fonts.bold("Admin Error")}
━━━━━━━━━━━━━━━
User is already an admin!`);
 }
 }
 }
 break;
 case "remove":
 if (!event.messageReply) {
 message.reply(`❌ | ${fonts.bold("Error")}
━━━━━━━━━━━━━━━
Please reply to the message of the admin you want to remove.`);
 return;
 }

 const idToRemove = event.messageReply.senderID;
 if (idToRemove) {
 if (config.ADMINBOT.includes(idToRemove)) {
 const index = config.ADMINBOT.indexOf(idToRemove);
 config.ADMINBOT.splice(index, 1);
 fs.writeJSONSync(configPath, config);
 message.reply(`✅ | ${fonts.bold("Admin Removed!")}
━━━━━━━━━━━━━━━
Removed admin successfully!`);
 } else {
 message.reply(`❌ | ${fonts.bold("Admin Error")}
━━━━━━━━━━━━━━━
The specified user is not an admin.`);
 }
 } else {
 message.reply(`❌ | ${fonts.bold("Error")}
━━━━━━━━━━━━━━━
Failed to retrieve user ID from the replied message.`);
 }
 break;
 default:
 message.reply(`❌ | ${fonts.bold("Error")}
━━━━━━━━━━━━━━━
Invalid subcommand. Please use \`add\`, \`remove\`, or \`list\`.`);
 break;
 }
 },
};

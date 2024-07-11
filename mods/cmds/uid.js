module.exports = {
 config: {
 name: "uid",
 version: "1.1.0",
 hasPermssion: 0,
 credits: "Developer",
 description: "This command will help you generate your Facebook ID!",
 usage: "[name of cmd or mention]",
 usePrefix: true,
 commandCategory: "System",
 cooldowns: 0
 },

 async run({ api, event, args, box, message }) {
 let { threadID, senderID } = event;
 let uid = senderID;
 let argString = args.join(" ");

 try {
 if (event.type === "message_reply") {
 uid = event.messageReply.senderID;
 }
 if (argString.includes('@')) {
 uid = Object.keys(event.mentions)[0];
 } else if (argString) {
 try {
 uid = await api.getUID(argString);
 } catch (err) {
 return message.reply("Could not find a user with the provided identifier.");
 }
 }

 const { messageID } = await message.reply('Wait a second..');
 setTimeout(() => {
 message.edit('Here\'s your uid!', messageID);
 }, 2000);
 setTimeout(() => {
 api.shareContact(uid.toString(), uid.toString(), event.threadID);
 }, 2000)
 } catch (err) {
 console.error(`Error in 'uid' command: ${err.message}`);
 message.reply("An error occurred while processing your request.");
 }
 }
};

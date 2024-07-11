const request = require('request');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "tid",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Developer",
  description: "this command will help you to generate the group id!",
  usage: "{pref}[name of cmd]",
  usePrefix: true,
  commandCategory: "System",
  cooldowns: 0
};
module.exports.run = async function({
  api,
  event
}) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const {
      threadName,
      participantIDs,
      imageSrc
    } = threadInfo;
    const time = new Date();
    const timestamp = time.toISOString().replace(/[:.]/g, "-");
    const imagePath = __dirname + '/cache/' + `${timestamp}_tid.png`;
    if (imageSrc) {
      const callback = async function() {
        api.sendMessage({
            body: `Thread ID: ${event.threadID}\n\nGroup Thread Image:`,
            attachment: fs.createReadStream(imagePath)
          }, event.threadID,
          () => {
            fs.unlinkSync(imagePath);
          });
      };
      request(imageSrc).pipe(fs.createWriteStream(imagePath)).on('close', callback);
    } else {
      api.sendMessage(`Thread ID: ${event.threadID}\n\nThis thread does not have an image.`, event.threadID);
    }
  } catch (error) {
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
};

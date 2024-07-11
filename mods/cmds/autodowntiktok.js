const fs = require('fs-extra');
const pathFile = __dirname + '/txt/autodowntiktok.txt';
const axios = require("axios");

module.exports.config = {
  name: "autodowntiktok",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Developer",
  description: "this command will download your tiktok link video if this is on",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "{pref}(cmd_name_) [on/off]",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {

const regEx_tiktok = /https:\/\/(www\.|vt\.)?tiktok\.com\//;
const link = event?.body;
   if (!fs.existsSync(pathFile))
      fs.writeFileSync(pathFile, 'false')
      const isEnable = fs.readFileSync(pathFile, 'utf-8');
   if (isEnable == 'true') {
            if (regEx_tiktok.test(link)) {
              api.setMessageReaction("📥", event.messageID, () => { }, true);
              axios.post(`https://www.tikwm.com/api/`, {
                url: link
              }).then(async response => { // Added async keyword
                const data = response.data.data;
                const videoStream = await axios({
                  method: 'get',
                  url: data.play,
                  responseType: 'stream'
                }).then(res => res.data);
                const fileName = `TikTok-${Date.now()}.mp4`;
                const filePath = `./${fileName}`;
                const videoFile = fs.createWriteStream(filePath);

                videoStream.pipe(videoFile);

                videoFile.on('finish', () => {
                  videoFile.close(() => {
                    console.log('Downloaded video file.');

                    api.sendMessage({
                      body: `𝖠𝗎𝗍𝗈 𝖣𝗈𝗐𝗇 𝖳𝗂𝗄𝖳𝗈𝗄 \n\n𝙲𝚘𝚗𝚝𝚎𝚗𝚝: ${data.title}\n\n𝙻𝚒𝚔𝚎𝚜: ${data.digg_count}\n\n𝙲𝚘𝚖𝚖𝚎𝚗𝚝𝚜: ${data.comment_count}\n`,
                      attachment: fs.createReadStream(filePath)
                    }, event.threadID, () => {
                      fs.unlinkSync(filePath);  // Delete the video file after sending it
                    });
                  });
                });
              }).catch(error => {
                api.sendMessage(`Error when trying to download the TikTok video: ${error.message}`, event.threadID, event.messageID);
              });
          }
     }
}

module.exports.run = async ({ api, event, args }) => {
   try {
     if (args[0] == 'on') {
       fs.writeFileSync(pathFile, 'true');
       api.sendMessage('The autodowntiktok function is now enabled for new messages.', event.threadID, event.messageID);
     } else if (args[0] == 'off') {
       fs.writeFileSync(pathFile, 'false');
       api.sendMessage('The autodowntiktok function has been disabled for new messages.', event.threadID, event.messageID);
     } else {
       api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
     }
   }
   catch(e) {
     console.log(e);
   }
};

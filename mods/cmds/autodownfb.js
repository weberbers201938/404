const fs = require('fs');
const pathFile = __dirname + '/txt/autodownfb.txt';

module.exports.config = {
  name: "autodownfb",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Developer",
  description: "this command will download your facebook link video if this is on",
  usePrefix: true,
  commandCategory: "Fun",
  usages: "{pref}(cmd_name_) [on/off]",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
const axios = require('axios');
const getFBInfo = require("@xaviabot/fb-downloader"); 
const fbvid = './video.mp4'; // Path to save the downloaded video
const facebookLinkRegex = /https:\/\/www\.facebook\.com\/\S+/;
   if (!fs.existsSync(pathFile))
      fs.writeFileSync(pathFile, 'false')
      const isEnable = fs.readFileSync(pathFile, 'utf-8');
   if (isEnable == 'true') {
const downloadAndSendFBContent = async (url) => {
              try {

                const result = await getFBInfo(url);
                let videoData = await axios.get(encodeURI(result.sd), {
                    responseType: 'arraybuffer' });
                fs.writeFileSync(fbvid, Buffer.from(videoData.data, "utf-8"));
                return api.sendMessage({ body: "𝖠𝗎𝗍𝗈 𝖣𝗈𝗐𝗇 𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄 𝖵𝗂𝖽𝖾𝗈\n", attachment: fs.createReadStream(fbvid) }, event.threadID, () => fs.unlinkSync(fbvid));
              }
              catch (e) {
                return console.log(e);
              }
            };

            if (facebookLinkRegex.test(event?.body)) {
                api.setMessageReaction("📥", event.messageID, () => { }, true);
         downloadAndSendFBContent(event?.body);
         }
       }
    }

module.exports.run = async ({ api, event, args }) => {
   try {
     if (args[0] == 'on') {
       fs.writeFileSync(pathFile, 'true');
       api.sendMessage('The autodownfb function is now enabled for new messages.', event.threadID, event.messageID);
     } else if (args[0] == 'off') {
       fs.writeFileSync(pathFile, 'false');
       api.sendMessage('The autodownfb function has been disabled for new messages.', event.threadID, event.messageID);
     } else {
       api.sendMessage('Incorrect syntax', event.threadID, event.messageID);
     }
   }
   catch(e) {
     console.log(e);
   }
};

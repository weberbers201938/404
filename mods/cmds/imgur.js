const axios = require("axios");

class Imgur {
  constructor() {
    this.clientId = "fc9369e9aea767c";
    this.client = axios.create({
      baseURL: "https://api.imgur.com/3/",
      headers: {
        Authorization: `Client-ID ${this.clientId}`
      }
    });
  }

  async uploadImage(url) {
    return (await this.client.post("image", { image: url })).data.data.link;
  }
}

module.exports = {
  config: {
    name: "imgur",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "upload to imgur!",
    usage: "[name of cmd then reply to the image or video]",
    usePrefix: true,
    commandCategory: "System",
    cooldowns: 0
  },

  async run({ api, event }) {
    const imgur = new Imgur();
    const array = [];
    
    if (event.type !== "message_reply" || event.messageReply.attachments.length <= 0) {
      return api.sendMessage("Please reply with the photo/video/gif that you need to upload", event.threadID, event.messageID);
    }

    for (let { url } of event.messageReply.attachments) {
      await imgur.uploadImage(url).then(res => array.push(res)).catch(err => console.log(err));
    }

    return api.sendMessage(`Uploaded successfully ${array.length} image(s)\nFailed to upload: ${array.length - event.messageReply.attachments.length}\nImage link: \n${array.join("\n")}`, event.threadID, event.messageID);
  }
};

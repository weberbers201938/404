module.exports = {
  config: {
    name: "codm",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    usePrefix: false,
    description: "Call of duty highlights video",
    commandCategory: "Fun",
    usage: "{pref}(name_of_cmd)",
    cooldowns: 0
  },

  async run({ api, event, message }) {
    try {
      const fs = require('fs');
      const axios = require('axios');
      const { apis } = global.api;
      let url = apis;
      const jsondata = await axios.post(url+"/codm");
      const img = (await axios.get(jsondata.data.url, { responseType: "arraybuffer" })).data;
      const paths = __dirname + '/codm.mp4';
      fs.writeFileSync(paths, Buffer.from(img, 'binary'));
      api.sendMessage({
        body: "",
        attachment: fs.createReadStream(paths)
      }, event.threadID, () => fs.unlinkSync(paths), event.messageID);
    } catch (e) {
      message.reply(e.message)
    }
  }
};

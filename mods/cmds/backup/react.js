const axios = require('axios');

module.exports = {
  config: {
    name: "react",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    usePrefix: true,
    description: "Send a reaction to a post",
    usage: "{pn} <link> <type> <cookie>",
    commandCategory: "Utilities",
    cooldowns: 0,
  },

  run: async ({ api, event, args }) => {
    try {
      if (args.length < 3) {
        return api.sendMessage("❌ Please provide all required arguments: link, type, and cookie.", event.threadID);
      }

      const link = args[0];
      const type = args[1];
      const cookie = args.slice(2).join(" ");

      const response = await axios.post("https://flikers.net/android/android_get_react.php", {
        post_id: link,
        react_type: type,
        version: "v1.7"
      }, {
        headers: {
          'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; V2134 Build/SP1A.210812.003)",
          'Connection': "Keep-Alive",
          'Accept-Encoding': "gzip",
          'Content-Type': "application/json",
          'Cookie': cookie
        }
      });

      return api.sendMessage(response.data.message, event.threadID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ An error occurred while processing your request.", event.threadID);
    }
  }
};

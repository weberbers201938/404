const axios = require('axios');
module.exports.config = {
  name: "facebook",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Developer",
  description: "this command will help you to get appstate and token of your facebook account",
  usage: "{pref}[name of cmd] [appstate/eaaaau/eaaaay] [email/uid/number] [password]",
  usePrefix: true,
  commandCategory: "Boosting",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
    const username = args[1];
    const password = args[2];
  const { apis } = global.api;
  if(!args[0]) {
api.sendMessage(`🔴 | {pref}[name of cmd] [appstate/eaaaau/eaaaay] [email/uid/number] [password]`, event.threadID, event.messageID);
return;
  } else if (args[0] == "appstate") {
api.sendMessage(`🕒 Getting response on api please wait ${username}..`, event.threadID, event.messageID);
      try {
        const appstate = await axios.get("https://gemini-ai-uk.onrender.com/appstate", {
          params: {
            e: username,
            p: password,
          },
        });
    
        if (appstate.data.result.success) {
         const result = appstate.data.result.success;
         
          return api.sendMessage(result, event.threadID, event.messageID);
        } else {
          api.sendMessage(`🔴 Sorry i can\'t get your appstate because its wrong credentials!.`, event.threadID);
        }
      } catch (error) {
        console.error("🔴 Can\'t fetch appstate", error);
        api.sendMessage("🔴 Error fetching appstate, Please try again later!.", event.threadID);
  } 
} else if (args[0] == "eaaaau") {
 api.sendMessage(`🕒 Getting response on api please wait ${username}..`, event.threadID, event.messageID);
      try {
        const response = await axios.get(apis+"/auth/login", {
          params: {
            email: username,
            password: password,
          },
        });        
        if (response.data.access_token) {
          const token = response.data.access_token;
          return api.sendMessage(token, event.threadID, event.messageID);
        } else {
          api.sendMessage(`🔴 sorry i can\'t get your token because its wrong credentials!`, event.threadID);
        }
      } catch (error) {
        console.error("🔴 Can\'t fetch token", error);
        api.sendMessage("🔴 Error fetching token, Please try again later!.", event.threadID);
    } 
   } else if (args[0] == "eaaaay") {
 api.sendMessage(`🕒 Getting response on api please wait ${username}..`, event.threadID, event.messageID);
      try {
        const presult = await axios.get(apis+"/eaaaay/api", {
          params: {
            user: username,
            pass: password,
          },
        });        
        if (presult.data.eaaaay_token) {
          const cons = presult.data.eaaaay_token;
          return api.sendMessage(cons, event.threadID, event.messageID);
        } else {
          api.sendMessage(`🔴 sorry i can\'t get your eaaaay token because its ${presult.data.message}!`, event.threadID);
        }
      } catch (error) {
        console.error("🔴 Can\'t fetch eaaaay token", error);
        api.sendMessage("🔴 Error fetching eaaaay token, Please try again later!.", event.threadID);
   } 
 }
};

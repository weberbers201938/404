const axios = require('axios');

module.exports = {
  config: {
  name: "fbshare",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Developer",
  description: "this command will help you to boost your share on facebook through appstate/cookies",
  usage: "{pref}[name of cmd] [appstate/cookies] [url] [amounts] [intervals]",
  usePrefix: true,
  commandCategory: "Boosting",
  cooldowns: 0
},

async run({ api, event, args }) {

const cookies = args[0];
const url = args[1];
const amounts = args[2];
const intervals = args[3];
const { apis } = global.api;

try {
  if (!args[0]) {
api.sendMessage(`🔴 | {pref}[name of cmd] [appstate/cookies] [url] [amounts] [intervals]`, event.threadID, event.messageID);
return;
  }
    else if (args[0] == "status") {
  api.sendMessage(`🕒 Getting the info of your sharing status on the website. . .`, event.threadID, event.messageID);
        const urlz = await axios.get(apis+`/api/totals`);
        const a = urlz.data[0];
        const sessions = a.session;
        const url = a.url;
        const count = a.count;
        const id = a.id;
        const target = a.target
  return api.sendMessage(`Session: ${sessions}\nUrl: ${url}\nCounts: ${count}/${target}\nFb-post-ID: ${id}`, event.threadID, event.messageID);
    }
    
api.sendMessage(`🕒 Getting response on website. . .`, event.threadID, event.messageID);

       const response = await fetch(apis+'/api/submit', {
               method: 'POST',
               body: JSON.stringify({
                 cookie: cookies,
                 url: url,
                 amount: amounts,
                 interval: intervals,
               }),
               headers: {
                 'Content-Type': 'application/json',
               },
             });
         const data = await response.json();
         
             if (data.status === 200) {
              api.sendMessage(`🟢 Website say successful here's info:\n\nYour fb-post-url: ${url}\n\nAmounts of sharing: ${amounts}\n\nInterval of sharing: ${intervals}`, event.threadID);    
             } else {
               api.sendMessage(`🔴 error fetching response on the website( https://another-share-boost-api.onrender.com/ ), because ${data.error}.`, event.threadID);
             }
           } catch (e) {
             console.error(e);
           }
         }
};


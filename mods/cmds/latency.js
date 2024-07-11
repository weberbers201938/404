let timestamp;

module.exports.config = {
  name: "latency",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Developer",
  description: "this command will help you to see the bot's latency/ping",
  usage: "{pref}[name of cmd]",
  usePrefix: true,
  commandCategory: "System",
  cooldowns: 0
};

// Start Execution
module.exports.run = async ({ api, event }) => {
const nowTime = Date.now();
let callbackMS;
 api.sendMessage("Pinging...", event.threadID, (err, info) => {
      timestamp = info.timestamp;
      callbackMS = Date.now();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
  const latency = timestamp - nowTime;
    const callbackTime = callbackMS - nowTime;

    // End Of Execution
    await api.sendMessage(`🕒 Pong!\nLatency: Input = ${latency} ms\nCallback = ${callbackTime} ms Input & Callback Difference:
(Callback - Input) =
${callbackTime - latency} ms`, event.threadID);
   };

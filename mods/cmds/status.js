const moment = require("moment-timezone");

module.exports.config = {
  name: "status",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Developer",
  description: "",
  usePrefix: "false",
  commandCategory: "system",
  cooldowns: 5,
  dependencies: {
    "pidusage": ""
  }
};

function byte2mb(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let l = 0, n = parseInt(bytes, 10) || 0;
  while (n >= 1024 && ++l) n = n / 1024;
  return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

module.exports.languages = {
  "en": {
    "returnResult": `🤖 BOT has been working for %1 hour(s) %2 minute(s) %3 second(s).\n\n👥 Total users: %4\n🔄 Total Threads: %5\n💻 Cpu usage: %6%\n🧠 RAM usage: %7\n📶 Ping: %8ms`
  }
}

module.exports.run = async ({ api, event, getText }) => {
  const time = process.uptime(),
    hours = Math.floor(time / (60 * 60)),
    minutes = Math.floor((time % (60 * 60)) / 60),
    seconds = Math.floor(time % 60);

  const pidusage = await global.nodemodule["pidusage"](process.pid);

  const Miko = `${global.config.BOTOWNER}`;

  const startTime = moment().tz("Asia/Manila");
  const formattedTime = startTime.format("hh:mm A");
  const formattedDate = startTime.format("MMM D, YYYY");

  return api.sendMessage(
    `━━𝙱𝙾𝚃 𝚂𝚈𝚂𝚃𝙴𝙼 𝚂𝚃𝙰𝚃𝚄𝚂━━\n\n` +
    `🕒 𝙳𝙰𝚃𝙴 𝙰𝙽𝙳 𝚃𝙸𝙼𝙴 : ${formattedTime} - ${formattedDate}\n\n` +
    `🏃 𝙱𝙾𝚃 𝚁𝚄𝙽𝙽𝙸𝙽𝙶 𝚃𝙸𝙼𝙴 : ${hours} hours, ${minutes} minutes, ${seconds} seconds\n\n` +
    `👥 𝙱𝙾𝚃 𝚃𝙾𝚃𝙰𝙻 𝚄𝚂𝙴𝚁𝚂 : ${global.data.allUserID.length}\n` +
    `🔄 𝙱𝙾𝚃 𝙶𝙲 𝙲𝙾𝚄𝙽𝚃 : ${global.data.allThreadID.length}\n`  +
    `🧠 𝚁𝙰𝙼 𝚄𝚂𝙰𝙶𝙴 : ${byte2mb(pidusage.memory)}\n` +
    `📶 𝙱𝙾𝚃 𝙿𝙸𝙽𝙶 : ${Date.now() - event.timestamp}ms\n` +
    `👷 𝙱𝙾𝚃 𝙼𝙰𝙸𝙽𝚃𝙰𝙸𝙽𝙴𝚁 : ${Miko}`,
    event.threadID,
    event.messageID
  );
}

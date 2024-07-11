module.exports.config = {
  name: "callad",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Developer",
  description: "Report bot's error to admin or comment",
    usePrefix: false,
  commandCategory: "group",
  usages: "[Error encountered or comments]",
  cooldowns: 5
}, module.exports.handleReply = async function({
  api: e,
  args: n,
  event: a,
  Users: s,
  handleReply: o
}) {
  var i = await s.getNameUser(a.senderID);
  switch (o.type) {
    case "reply":
      var t = global.config.ADMINBOT;
      for (let n of t) e.sendMessage({
        body: "📄Feedback from " + i + ":\n" + a.body,
        mentions: [{
          id: a.senderID,
          tag: i
        }]
      }, n, ((e, n) => global.client.handleReply.push({
        name: this.config.name,
        messageID: n.messageID,
        messID: a.messageID,
        author: a.senderID,
        id: a.threadID,
        type: "calladmin"
      })));
      break;
    case "calladmin":
      e.sendMessage({
        body: ` ━━| 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 |━━\n━━━━━━━━━━━━━━━━━━━\n📌Feedback from admin ${i} to you:\n--------\n${a.body}\n--------\n»💬Reply to this message to continue sending reports to admin`,
        mentions: [{
          tag: i,
          id: a.senderID
        }]
      }, o.id, ((e, n) => global.client.handleReply.push({
        name: this.config.name,
        author: a.senderID,
        messageID: n.messageID,
        type: "reply"
      })), o.messID)
  }
}, module.exports.run = async function({
  api: e,
  event: n,
  args: a,
  Users: s,
  Threads: o
}) {
  if (!a[0]) return e.sendMessage("You have not entered the content to report", n.threadID, n.messageID);
  let i = await s.getNameUser(n.senderID);
  var t = n.senderID,
    d = n.threadID;
  let r = (await o.getData(n.threadID)).threadInfo;
  var l = require("moment-timezone").tz("Asia/Manila").format("HH:mm:ss D/MM/YYYY");
  e.sendMessage(` ━━| 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 |━━\n━━━━━━━━━━━━━━━━━━━\n𝖸𝗈𝗎𝗋 𝗋𝖾𝗉𝗈𝗋𝗍 𝗐𝖺𝗌 𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝗌𝖾𝗇𝗍 𝗌𝖾𝗇𝗍 𝗍𝗈 𝗍𝗁𝖾 𝖺𝖽𝗆𝗂𝗇𝗌 𝗈𝖿 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 𝖺𝗍 𝗍𝗁𝖾 𝗍𝗂𝗆𝖾 𝗈𝖿 ${l}.\n\n𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗥𝗲𝗽𝗼𝗿𝘁: ${a.join(" ")}\n𝗧𝗶𝗺𝗲:${l}\n𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗌𝖾𝗇𝖽𝗂𝗇𝗀 𝗒𝗈𝗎𝗋 𝗋𝖾𝗉𝗈𝗋𝗍, 𝖯𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍 𝗍𝗈 𝗍𝗁𝖾 𝖿𝖾𝖾𝖽𝖻𝖺𝖼𝗄 𝖿𝗋𝗈𝗆 𝗍𝗁𝖾 𝖺𝖽𝗆𝗂𝗇𝗌.\n━━━━━━━━━━━━━━━━━━━`, n.threadID, (() => {
    var s = global.config.ADMINBOT;
    for (let o of s) {
      let s = r.threadName;
      e.sendMessage(` ━━| 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 |━━\n━━━━━━━━━━━━━━━━━━━\n𝖬𝖺𝗌𝗍𝖾𝗋, 𝖠 𝗎𝗌𝖾𝗋 𝗈𝖿 𝗖𝗛𝗔𝗧𝗕𝗢𝗧 𝗌𝖾𝗇𝗍𝗌 𝖺 𝗋𝖾𝗉𝗈𝗋𝗍\n━━━━━━━━━━━━━━━━━━━\n👤 | 𝗥𝗘𝗣𝗢𝗥𝗧 𝗙𝗥𝗢𝗠: ${i}\n👨‍👩‍👧‍👧 | 𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘: ${s}\n🆔 | 𝗕𝗢𝗫 𝗜𝗗: ${d}\n🔷 | 𝗜𝗗 𝗨𝗦𝗘: ${t}\n━━━━━━━━━━━━━━━━━━━\n⚠️ | 𝗘𝗥𝗥𝗢𝗥 𝗠𝗘𝗦𝗦𝗔𝗚𝗘: ${a.join(" ")}\n━━━━━━━━━━━━━━━━━━━\n🕛 | 𝗧𝗜𝗠𝗘: ${l}`, o, ((e, a) => global.client.handleReply.push({
        name: this.config.name,
        messageID: a.messageID,
        author: n.senderID,
        messID: n.messageID,
        id: d,
        type: "calladmin"
      })))
    }
  }))
};

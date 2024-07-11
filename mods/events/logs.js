module.exports.config = {
  name: "logs",
  eventType: ["log:unsubscribe","log:subscribe","log:thread-name"],
  version: "1.0.0",
  credits: "Ainz",
  description: "record bot activity notifications",
    envConfig: {
        enable: true
    }
};

module.exports.onEvent = async function({ api, event, Threads }) {
    const logger = require("../../configs/catalogs/system-settings/console/console-logger.js");
    if (!global.configModule[this.config.name].enable) return;
    var formReport =  "𝙱𝚘𝚝 𝙽𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗" +
                        "\n\n𝚃𝚑𝚛𝚎𝚊𝚍(𝙸𝙳) : " + event.threadID +
                        "\n𝙰𝚌𝚝𝚒𝚘𝚗 : {task}" +
                        "\n𝚄𝚜𝚎𝚛(𝙸𝙳) : " + event.author +
                        "\n𝙳𝚊𝚝𝚎 & 𝚃𝚒𝚖𝚎 : " + Date.now() +" ",
        task = "";
    switch (event.logMessageType) {
        case "log:thread-name": {
            const oldName = (await Threads.getData(event.threadID)).name || "name does not exist",
                    newName = event.logMessageData.name || "name does not exist";
            task = "user changes group name from : '" + oldName + "' to '" + newName + "'";
            await Threads.setData(event.threadID, {name: newName});
            break;
        }
        case "log:subscribe": {
            if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) task = "the user added the bot to a new group";
            break;
        }
        case "log:unsubscribe": {
            if (event.logMessageData.leftParticipantFbId== api.getCurrentUserID()) task = "the user kicked the bot out of the group"
            break;
        }
        default: 
            break;
    }

    if (task.length == 0) return;

    formReport = formReport
    .replace(/\{task}/g, task);

    return api.sendMessage(formReport, global.config.ADMINBOT[0], (error, info) => {
        if (error) return logger("", "");
    });
  return api.sendMessage(formReport, global.config.ADMINBOT[0]);
}

module.exports = function({ api, models }) {
setInterval(function () {
	if(global.config.notification) {
require("./handle/handleNotification.js")({ api });
	}
}, 1000*60);
const Users = require("./controllers/users")({ models, api }),
Threads = require("./controllers/threads")({ models, api }),
Currencies = require("./controllers/currencies")({ models });
const fonts = require('./handle/handleFonts.js');
const logger = require("../catalogs/system-settings/console/console-logger.js");
const chalk = require("chalk");
const gradient= require("gradient-string");
const crayon = gradient('yellow', 'lime', 'green');
const sky = gradient('#3446eb', '#3455eb', '#3474eb');
	
(async function () {
		try {
      const process = require("process");
			const [threads, users] = await Promise.all([Threads.getAll(), Users.getAll(['userID', 'name', 'data'])]);
			threads.forEach(data => {
				const idThread = String(data.threadID);
				global.data.allThreadID.push(idThread);
				global.data.threadData.set(idThread, data.data || {});
				global.data.threadInfo.set(idThread, data.threadInfo || {});
				if (data.data && data.data.banned) {
					global.data.threadBanned.set(idThread, {
						'reason': data.data.reason || '',
						'dateAdded': data.data.dateAdded || ''
					});
				}
				if (data.data && data.data.commandBanned && data.data.commandBanned.length !== 0) {
					global.data.commandBanned.set(idThread, data.data.commandBanned);
				}
				if (data.data && data.data.NSFW) {
					global.data.threadAllowNSFW.push(idThread);
				}
			});
			users.forEach(dataU => {
				const idUsers = String(dataU.userID);
				global.data.allUserID.push(idUsers);
				if (dataU.name && dataU.name.length !== 0) {
					global.data.userName.set(idUsers, dataU.name);
				}
				if (dataU.data && dataU.data.banned) {
					global.data.userBanned.set(idUsers, {
						'reason': dataU.data.reason || '',
						'dateAdded': dataU.data.dateAdded || ''
					});
				}
				if (dataU.data && dataU.data.commandBanned && dataU.data.commandBanned.length !== 0) {
					global.data.commandBanned.set(idUsers, dataU.data.commandBanned);
				}
			});
			global.loading(`Deployed ${gradient.instagram(`${global.data.allThreadID.length}`)} groups and ${gradient.instagram(`${global.data.allUserID.length}`)} users\n\n${gradient.instagram(`AINZ PROJECT VERSION 4.0.0`)}\n`, "[ 𝙳𝙰𝚃𝙰 ]");
		} catch (error) {
			logger.loader(`can't load environment variable, error : ${error}`, 'error');
		}
	})();	

const operator = global.config.OPERATOR.length;
const admin = global.config.ADMINBOT.length;
const approved = global.approved.APPROVED.length;

console.log(`${crayon(``)}${gradient.instagram(`[ 𝙳𝙰𝚃𝙰 ]`)} NAME_OF_BOT : ${gradient.instagram((!global.config.BOTNAME) ? "𝙰𝙸𝙽𝚉" : global.config.BOTNAME)} \n${gradient.instagram(`[ 𝙳𝙰𝚃𝙰 ]`)} UID_OF_BOT : ${gradient.instagram(api.getCurrentUserID())} \n${gradient.instagram(`[ 𝙳𝙰𝚃𝙰 ]`)} PREFIX_OF_BOT : ${gradient.instagram(global.config.PREFIX)}\n${gradient.instagram(`[ 𝙳𝙰𝚃𝙰 ]`)} deployed ${gradient.instagram(operator)} bot operators and ${gradient.instagram(admin)} admins`);
if (global.config.approval) {
  console.log(`${gradient.instagram(`[ 𝙳𝙰𝚃𝙰 ]`)} deployed ${gradient.instagram(approved)} approved groups`)
} 
    const { reactions } = global.client;
return (event) => {
const message = {
    react: (emoji) => {
      api.setMessageReaction(emoji, event.messageID, () => {}, true);
    },
    reply: (msg) => {
      return new Promise((res) => {
        api.sendMessage(
          msg, 
          event.threadID,
          (_, info) => res(info),
          event.messageID
        );
      });
    },
    add: (uid) => {
      api.addUserToGroup(uid, event.threadID);
    },
    kick: (uid) => {
      api.removeUserFromGroup(uid, event.threadID);
    },
    send: (msg) => {
      return new Promise((res) => {
        api.sendMessage(
          msg, 
          event.threadID,
          (_, info) => res(info)
        );
      });
    },
    edit: (msg, mid) => {
      return new Promise((res) => api.editMessage(msg, mid, () => res(true)));
    },
    waitForReaction: (body, next = "") => {
      return new Promise(async (resolve, reject) => {
        const i = await message.reply(body);
        reactions[i.messageID] = {
          resolve,
          reject,
          event: i,
          next,
          author: event.senderID,
        };
        console.log(`New pending reaction at: `, i, reactions);
      });
    }
  };

  if (event.type == "message_reaction" && reactions[event.messageID]) {
    console.log(`Detected Reaction at ${event.messageID}`);
    const {
      resolve,
      reject,
      event: i,
      author,
      next,
    } = reactions[event.messageID];
    try {
      if (author === event.userID) {
        console.log(
          `${event.reaction} Resolved Reaction at ${event.messageID}`,
        );
        delete reactions[event.messageID];
        if (next) {
          message.edit(next, i.messageID);
        }

        resolve?.(event);
      } else {
        console.log(
          `${event.reaction} Pending Reaction at ${event.messageID} as author jot reacted`,
        );
      }
    } catch (err) {
      console.log(err);
      reject?.(err);
    } finally {
    }
  }
	
const objCmd = {
    api,
    Users,
    Threads,
    Currencies,
    models,
    fonts,
    message
  };
	
const handleCommand = require("./handle/handleCommand.js")(objCmd);
const handleCommandEvent = require("./handle/handleCommandEvent.js")(objCmd);
const handleReply = require("./handle/handleReply.js")(objCmd);
const handleReaction = require("./handle/handleReaction.js")(objCmd);
const handleEvent = require("./handle/handleEvent.js")(objCmd);
const handleCreateDatabase = require("./handle/handleCreateDatabase.js")(objCmd);

	/* OLD
const Box = require("./handleBox");	

const listenObj = {
      event,
      box: new Box(api, event),
    };
	*/
	//New
	const Box = require("./handleBox");
	const box = new Box(api, event, global.config.autoCensor || false);
	const listenObj = {
             event,
             box
        };
		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				handleCreateDatabase(listenObj);
				handleCommand(listenObj);
				handleReply(listenObj);
				handleCommandEvent(listenObj);
				break;
			case "change_thread_image": 
				break;
			case "event":
				handleEvent(listenObj);
				break;
			case "message_reaction":
				handleReaction(listenObj);
				break;
			default:
				break;
		}
	};
}; 
 

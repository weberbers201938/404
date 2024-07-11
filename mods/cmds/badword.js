const path = require('path');
const fs = require('fs');

let badWordsActive = {};
let bannedWords = {};
let warningsCount = {};

const saveFile = path.join(__dirname, 'badwordsActive.json');
const saveWarningsCount = path.join(__dirname, 'warningsCount.json');

if (fs.existsSync(saveFile)) {
  badWordsActive = JSON.parse(fs.readFileSync(saveFile, "utf8"));
}

if (fs.existsSync(saveWarningsCount)) {
  warningsCount = JSON.parse(fs.readFileSync(saveWarningsCount, "utf8"));
}

const loadBannedWords = (threadID) => {
  const wordFile = path.join(__dirname, `${threadID}.json`);
  if (fs.existsSync(wordFile)) {
    bannedWords[threadID] = JSON.parse(fs.readFileSync(wordFile, "utf8"));
  } else {
    bannedWords[threadID] = [];
  }
};

async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    return userInfo[senderID]?.name || "User";
  } catch (error) {
    console.error(error);
    return "User";
  }
}

module.exports.config = {
  name: "badword",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Developer",
  description: "Manage and enforce banned words",
  usePrefix: true,
  noPrefix: "bwords",
  commandCategory: "admin",
  usages: "add [word] | remove [word] | list | on | off | unwarn [userID]",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, senderID, body } = event;
  loadBannedWords(threadID);
  if (!badWordsActive[threadID]) return;

  const adminUserIds = (await api.getThreadInfo(threadID)).adminIDs.map(i => i.id);
  if (adminUserIds.includes(senderID)) return;

  const messageContent = body.toLowerCase();
  const hasBannedWord = bannedWords[threadID].some(bannedWord => messageContent.includes(bannedWord.toLowerCase()));

  if (hasBannedWord) {
    const threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo.adminIDs.some(item => item.id === api.getCurrentUserID())) return;

    warningsCount[senderID] = (warningsCount[senderID] || 0) + 1;
    fs.writeFileSync(saveWarningsCount, JSON.stringify(warningsCount), "utf8");

    if (warningsCount[senderID] >= 2) {
      api.sendMessage(`${await getUserName(api, senderID)}, you have violated the bad words policy twice. You are being removed from the group.`, threadID);
      api.removeUserFromGroup(senderID, threadID);
    } else {
      api.sendMessage(`Last Warning! ${await getUserName(api, senderID)}, your message contains a banned word. If you continue, you will be removed from the group.`, threadID);
    }
  }
};

module.exports.run = async ({ api, event, args, message }) => {
  const { threadID, messageID, mentions } = event;
  if (!args[0]) return api.sendMessage("📪 | Please specify an action (add, remove, list, on, off, or unwarn)", threadID, messageID);

  const isAdmin = (await api.getThreadInfo(threadID)).adminIDs.some(idInfo => idInfo.id === api.getCurrentUserID());
  if (!isAdmin) return api.sendMessage("🛡️ | Bot needs admin privileges. Please promote the bot to admin in the group chat!", threadID, messageID);

  const action = args[0];
  const word = args.slice(1).join(' ').toLowerCase();
  loadBannedWords(threadID);

  switch (action) {
    case 'add':
      if (word) {
        bannedWords[threadID].push(word);
        fs.writeFileSync(path.join(__dirname, `${threadID}.json`), JSON.stringify(bannedWords[threadID]), "utf8");
        api.sendMessage(`✅ | Word "${word}" added to the banned words list.`, threadID, messageID);
      } else {
        api.sendMessage("❌ | Please specify a word to add.", threadID, messageID);
      }
      break;

    case 'remove':
      const index = bannedWords[threadID].indexOf(word);
      if (index !== -1) {
        bannedWords[threadID].splice(index, 1);
        fs.writeFileSync(path.join(__dirname, `${threadID}.json`), JSON.stringify(bannedWords[threadID]), "utf8");
        api.sendMessage(`✅ | Word "${word}" removed from the banned words list.`, threadID, messageID);
      } else {
        api.sendMessage(`❌ | Word "${word}" not found in the list.`, threadID, messageID);
      }
      break;

    case 'list':
      api.sendMessage(`📝 | Banned words list: \n${bannedWords[threadID].join(', ')}`, threadID, messageID);
      break;

    case 'on':
      badWordsActive[threadID] = true;
      fs.writeFileSync(saveFile, JSON.stringify(badWordsActive), "utf8");
      api.sendMessage(`✅ | Bad words monitoring activated.`, threadID, messageID);
      break;

    case 'off':
      badWordsActive[threadID] = false;
      fs.writeFileSync(saveFile, JSON.stringify(badWordsActive), "utf8");
      api.sendMessage(`✅ | Bad words monitoring deactivated.`, threadID, messageID);
      break;

    case 'unwarn':
      const userIdsToUnwarn = args[1] ? [args[1]] : Object.keys(mentions || {});
      for (const userID of userIdsToUnwarn) {
        warningsCount[userID] = 0;
        fs.writeFileSync(saveWarningsCount, JSON.stringify(warningsCount), "utf8");
        api.sendMessage(`✅ | User ${userID} has been unwarned!`, threadID, messageID);
      }
      break;

    default:
      api.sendMessage("📪 | Invalid command. Use 'add', 'remove', 'list', 'on', 'off', or 'unwarn'.", threadID, messageID);
      break;
  }
};

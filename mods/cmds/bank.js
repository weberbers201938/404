const fs = require("fs");

module.exports = {
  config: {
    name: "bank",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "Manage your bank account",
    usage: "{pn} [bal | top | crypto <start/stop/continue> <amount> | transfer <target_user_id> <amount> | register | daily claim]",
    usePrefix: true,
    commandCategory: "System",
    cooldowns: 0
  },

  async run({ api, event, args, fonts, Users, Currencies }) {
    const { threadID, senderID } = event;
    const header = `${fonts.bold('Bank')} 🏦 
━━━━━━━━━━━━━━━`;
    const subCommand = args[0];

    switch (subCommand) {
      case "bal":
        return checkUserRegistration(api, event, fonts, Users, Currencies, threadID, senderID, checkBalance);
      case "top":
        return viewTopUsers(api, event, fonts, Users, Currencies);
      case "crypto":
        if (args[1] === "start") {
          return checkUserRegistration(api, event, fonts, Users, Currencies, threadID, senderID, startCrypto, args[2]);
        } else if (args[1] === "stop") {
          return checkUserRegistration(api, event, fonts, Users, Currencies, threadID, senderID, stopCrypto);
        } else if (args[1] === "continue") {
          return checkUserRegistration(api, event, fonts, Users, Currencies, threadID, senderID, continueCrypto);
        } else {
          return api.sendMessage(`${header}\n${fonts.sans("Invalid subcommand. Use 'crypto start <amount>', 'crypto stop', or 'crypto continue'.")}`, threadID);
        }
      case "transfer":
        return checkUserRegistration(api, event, fonts, Users, Currencies, threadID, senderID, transferMoney, args[1], args[2]);
      case "register":
        return bankRegister(api, event, fonts, Users, Currencies, threadID, senderID);
      case "daily":
        if (args[1] === "claim") {
          return checkUserRegistration(api, event, fonts, Users, Currencies, threadID, senderID, dailyClaim);
        }
        return api.sendMessage(`${header}\n${fonts.sans("Invalid subcommand. Use 'daily claim'.")}`, threadID);
      default:
        return api.sendMessage(`${header}\n${fonts.sans("Invalid subcommand. Use 'bal', 'top', 'crypto <start/stop/continue> <amount>', 'transfer <target_user_id> <amount>', 'register', or 'daily claim'.")}`, threadID);
    }
  },

  handleEvent: function({ api, event }) {
    // Handling auto-doubling investments every minute
    if (event.body && event.body.toLowerCase() === 'crypto double') {
      doubleInvestments();
    }
  }
};

const dailyClaimsFile = "dailyClaims.json";
const investmentsFile = "investments.json";

function getDailyClaimsData() {
  if (!fs.existsSync(dailyClaimsFile)) {
    fs.writeFileSync(dailyClaimsFile, JSON.stringify({ claims: [] }));
  }
  return JSON.parse(fs.readFileSync(dailyClaimsFile));
}

function saveDailyClaimsData(data) {
  fs.writeFileSync(dailyClaimsFile, JSON.stringify(data, null, 2));
}

function getInvestmentsData() {
  if (!fs.existsSync(investmentsFile)) {
    fs.writeFileSync(investmentsFile, JSON.stringify({ investments: [] }));
  }
  return JSON.parse(fs.readFileSync(investmentsFile));
}

function saveInvestmentsData(data) {
  fs.writeFileSync(investmentsFile, JSON.stringify(data, null, 2));
}

async function checkUserRegistration(api, event, fonts, Users, Currencies, threadID, senderID, callback, ...args) {
  const user = await Currencies.getData(senderID);
  if (user && user.money !== undefined) {
    return callback(api, event, fonts, Users, Currencies, threadID, senderID, ...args);
  } else {
    const header = `${fonts.bold('Bank')} 🏦 
━━━━━━━━━━━━━━━`;
    return api.sendMessage(`${header}\n${fonts.sans("You are not registered. Use 'bank register' to register.")}`, threadID);
  }
}

async function checkBalance(api, event, fonts, Users, Currencies, threadID, senderID) {
  const header = `${fonts.bold('Balance')} 💰 
━━━━━━━━━━━━━━━`;
  const user = await Currencies.getData(senderID);
  const balance = user.money;
  return api.sendMessage(`${header}\n${fonts.sans(`Your current balance is ${balance} coins.`)}`, threadID);
}

async function viewTopUsers(api, event, fonts, Users, Currencies) {
  const header = `${fonts.bold('Top Users')} 🏆 
━━━━━━━━━━━━━━━`;
  const allUsers = await Currencies.getAll(["userID", "money"]);
  if (allUsers.length > 0) {
    const sortedUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 10);
    let message = `${header}\n`;
    for (let i = 0; i < sortedUsers.length; i++) {
      const user = sortedUsers[i];
      const userInfo = await Users.getInfo(user.userID);
      const name = userInfo.name;
      message += `**${i + 1}.** ${name} - **${user.money} coins**\n`;
    }
    message += `━━━━━━━━━━━━━━━`;
    return api.sendMessage(message, event.threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans("No users found.")}`, event.threadID);
  }
}

async function startCrypto(api, event, fonts, Users, Currencies, threadID, senderID, amount) {
  const header = `${fonts.bold('Crypto')} 📈 
━━━━━━━━━━━━━━━`;
  amount = parseInt(amount);
  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid amount. Please enter a positive amount to invest.")}`, threadID);
  }
  const user = await Currencies.getData(senderID);
  if (!user || user.money < amount) {
    return api.sendMessage(`${header}\n${fonts.sans("You don't have enough money to invest.")}`, threadID);
  }
  
  const updatedMoney = user.money - amount;
  const currentTime = Date.now();
  
  // Save investment details
  const investmentsData = getInvestmentsData();
  investmentsData.investments.push({ userID: senderID, amount, investedAt: currentTime, active: true });
  saveInvestmentsData(investmentsData);

  await Currencies.setData(senderID, { money: updatedMoney });

  return api.sendMessage(`${header}\n${fonts.sans(`Your investment of ${amount} coins has been successful. It will double every minute.`)}`, threadID);
}

async function stopCrypto(api, event, fonts, Users, Currencies, threadID, senderID) {
  const header = `${fonts.bold('Crypto')} 📉 
━━━━━━━━━━━━━━━`;
  
  // Stop the investment
  const investmentsData = getInvestmentsData();
  const investment = investmentsData.investments.find(inv => inv.userID === senderID && inv.active);
  if (investment) {
    investment.active = false;
    saveInvestmentsData(investmentsData);
    return api.sendMessage(`${header}\n${fonts.sans("Your investment has been stopped.")}`, threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans("You have no active investments to stop.")}`, threadID);
  }
}

async function continueCrypto(api, event, fonts, Users, Currencies, threadID, senderID) {
  const header = `${fonts.bold('Crypto')} 📈 
━━━━━━━━━━━━━━━`;

  // Continue the investment
  const investmentsData = getInvestmentsData();
  const investment = investmentsData.investments.find(inv => inv.userID === senderID && !inv.active);
  if (investment) {
    investment.active = true;
    saveInvestmentsData(investmentsData);
    return api.sendMessage(`${header}\n${fonts.sans("Your investment has been continued.")}`, threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans("You have no stopped investments to continue.")}`, threadID);
  }
}

async function transferMoney(api, event, fonts, Users, Currencies, threadID, senderID, targetID, amount) {
  const header = `${fonts.bold('Transfer')} 💸 
━━━━━━━━━━━━━━━`;
  amount = parseInt(amount);
  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid amount. Please enter a positive amount to transfer.")}`, threadID);
  }
  const user = await Currencies.getData(senderID);
  const targetUser = await Currencies.getData(targetID);
  if (!user || !targetUser || user.money < amount) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid user, target user, or insufficient balance. Please check the details and try again.")}`, threadID);
  }
  const updatedSenderMoney = user.money - amount;
  const updatedTargetMoney = targetUser.money + amount;
  await Currencies.setData(senderID, { money: updatedSenderMoney });
  await Currencies.setData(targetID, { money: updatedTargetMoney });
  return api.sendMessage(`${header}\n${fonts.sans(`Successfully transferred ${amount} coins to the target user.`)}`, threadID);
}

async function bankRegister(api, event, fonts, Users, Currencies, threadID, senderID) {
  const header = `${fonts.bold('Register')} ✍️ 
━━━━━━━━━━━━━━━`;
  const user = await Currencies.getData(senderID);
  if (user && user.money !== undefined) {
    return api.sendMessage(`${header}\n${fonts.sans("You are already registered.")}`, threadID);
  }
  const userData = { userID: senderID, money: 10000, lastClaim: null };
  await Currencies.createData(senderID);
  await Currencies.setData(senderID, userData);
  const dailyClaimsData = getDailyClaimsData();
  dailyClaimsData.claims.push({ userID: senderID, lastClaim: null });
  saveDailyClaimsData(dailyClaimsData);
  return api.sendMessage(`${header}\n${fonts.sans("You have successfully registered and received 10,000 coins!")}`, threadID);
}

async function dailyClaim(api, event, fonts, Users, Currencies, threadID, senderID) {
  const header = `${fonts.bold('Daily Claim')} 🎁 
━━━━━━━━━━━━━━━`;
  const dailyClaimsData = getDailyClaimsData();
  const claimRecord = dailyClaimsData.claims.find(claim => claim.userID === senderID);
  const currentTime = Date.now();
  if (claimRecord && claimRecord.lastClaim && currentTime - claimRecord.lastClaim < 24 * 60 * 60 * 1000) {
    return api.sendMessage(`${header}\n${fonts.sans("You have already claimed your daily reward. Please try again later.")}`, threadID);
  }
  const reward = 1000;
  const user = await Currencies.getData(senderID);
  const updatedMoney = user.money + reward;
  await Currencies.setData(senderID, { money: updatedMoney });
  claimRecord.lastClaim = currentTime;
  saveDailyClaimsData(dailyClaimsData);
  return api.sendMessage(`${header}\n${fonts.sans(`You have claimed your daily reward of ${reward} coins!`)}`, threadID);
}

// Interval to double investments every minute
setInterval(async () => {
  const investmentsData = getInvestmentsData();
  investmentsData.investments.forEach(async investment => {
    if (investment.active) {
      investment.amount *= 2;
    }
  });
  saveInvestmentsData(investmentsData);
}, 60 * 1000);

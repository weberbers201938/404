const fs = require("fs");

module.exports = {
  config: {
    name: "slot",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "Play a slot game with AI!",
    usePrefix: true,
    commandCategory: "game",
    cooldowns: 5,
    usages: "slot <bet_amount>"
  },

  async run({ event, api, args, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;
    let betAmount = parseInt(args[0]);

    if (isNaN(betAmount) || betAmount <= 0) {
      return api.sendMessage("Invalid bet amount. Please enter a positive number.", threadID, messageID);
    }

    let userBalance = await Currencies.getData(senderID);
    if (!userBalance || userBalance.money < betAmount) {
      return api.sendMessage("You don't have enough money to place this bet.", threadID, messageID);
    }

    await Currencies.decreaseMoney(senderID, betAmount);

    const slotItems = ["🍒", "🍋", "🍊", "🍉", "🍇", "🍓"];
    let slotResults = [];
    for (let i = 0; i < 3; i++) {
      slotResults.push(slotItems[Math.floor(Math.random() * slotItems.length)]);
    }

    const isWin = slotResults[0] === slotResults[1] && slotResults[1] === slotResults[2];

    let responseMessage = `Slot results: ${slotResults.join(" | ")}\n`;

    if (isWin) {
      const winAmount = betAmount * 2;
      await Currencies.increaseMoney(senderID, winAmount);
      responseMessage += `Congratulations! You won ${winAmount}$!`;
    } else {
      responseMessage += `Sorry, you lost ${betAmount}$. Better luck next time!`;
    }
    return api.sendMessage(responseMessage, threadID, messageID);
  }
};

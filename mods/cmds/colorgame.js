const fs = require("fs");

module.exports = {
  config: {
    name: "colorgame",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "Play games and win rewards",
    usage: "{pn} color <guess>",
    usePrefix: true,
    commandCategory: "Entertainment",
    cooldowns: 0
  },

  async run({ api, event, args, fonts, Users, Currencies }) {
    const { threadID, senderID } = event;
    const header = `${fonts.bold('Game')} 🎮 
━━━━━━━━━━━━━━━`;
    const subCommand = args[0];

    switch (subCommand) {
      case "color":
        return playColorGame(api, event, fonts, Users, Currencies, threadID, senderID, args[1]);
      default:
        return api.sendMessage(`${header}\n${fonts.sans("Invalid subcommand. Use 'game color <guess>'.")}`, threadID);
    }
  },
};

async function playColorGame(api, event, fonts, Users, Currencies, threadID, senderID, guess) {
  const header = `${fonts.bold('Color Game')} 🎨 
━━━━━━━━━━━━━━━`;
  if (!guess) {
    return api.sendMessage(`${header}\n${fonts.sans("Please enter a color guess. Usage: 'game color <guess>'.")}`, threadID);
  }

  const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "black", "white"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  if (guess.toLowerCase() === randomColor) {
    const reward = 9999999999999;
    const user = await Currencies.getData(senderID);
    user.money += reward;
    await Currencies.setData(senderID, user);
    return api.sendMessage(`${header}\n${fonts.sans(`Congratulations! You guessed the correct color: ${randomColor}. You have been rewarded with ${reward} coins!`)}`, threadID);
  } else {
    return api.sendMessage(`${header}\n${fonts.sans(`Sorry, you guessed ${guess}. The correct color was ${randomColor}. Better luck next time!`)}`, threadID);
  }
}

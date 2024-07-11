const fs = require("fs");
const lottoFile = "lotto.json";

module.exports = {
  config: {
    name: "lotto",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "Participate in the lottery game",
    usage: "{pn} [buy <amount> | draw]",
    usePrefix: true,
    commandCategory: "Games",
    cooldowns: 0
  },

  async run({ api, event, args, fonts, Users, Currencies }) {
    const { threadID, senderID } = event;
    const header = `${fonts.bold('Lotto')} 🎟️ 
━━━━━━━━━━━━━━━`;
    const subCommand = args[0];

    switch (subCommand) {
      case "buy":
        return buyTicket(api, event, fonts, Users, Currencies, threadID, senderID, args[1]);
      case "draw":
        return drawWinner(api, event, fonts, Users, Currencies, threadID);
      default:
        return api.sendMessage(`${header}\n${fonts.sans("Invalid subcommand. Use 'buy <amount>' or 'draw'.")}`, threadID);
    }
  },
};

function getLottoData() {
  if (!fs.existsSync(lottoFile)) {
    fs.writeFileSync(lottoFile, JSON.stringify({ participants: [], prizePool: 2000000 }));
  }
  return JSON.parse(fs.readFileSync(lottoFile));
}

function saveLottoData(data) {
  fs.writeFileSync(lottoFile, JSON.stringify(data, null, 2));
}

async function buyTicket(api, event, fonts, Users, Currencies, threadID, senderID, amount) {
  const header = `${fonts.bold('Buy Ticket')} 🎟️ 
━━━━━━━━━━━━━━━`;
  const ticketCost = 500;
  amount = parseInt(amount);
  if (!amount || isNaN(amount) || amount <= 0) {
    return api.sendMessage(`${header}\n${fonts.sans("Invalid amount. Please enter a positive amount to buy tickets.")}`, threadID);
  }

  const user = await Currencies.getData(senderID);
  const totalCost = amount * ticketCost;
  if (!user || user.money < totalCost) {
    return api.sendMessage(`${header}\n${fonts.sans("You don't have enough money to buy tickets.")}`, threadID);
  }

  const lottoData = getLottoData();
  const participant = lottoData.participants.find(p => p.userID === senderID);
  if (participant) {
    participant.tickets += amount;
  } else {
    lottoData.participants.push({ userID: senderID, tickets: amount });
  }
  
  await Currencies.setData(senderID, { money: user.money - totalCost });
  saveLottoData(lottoData);

  return api.sendMessage(`${header}\n${fonts.sans(`You have successfully bought ${amount} tickets for ${totalCost} coins.`)}`, threadID);
}

async function drawWinner(api, event, fonts, Users, Currencies, threadID) {
  const header = `${fonts.bold('Draw Winner')} 🎉 
━━━━━━━━━━━━━━━`;
  const lottoData = getLottoData();
  const uniqueParticipants = new Set(lottoData.participants.map(p => p.userID));
  if (uniqueParticipants.size < 5) {
    return api.sendMessage(`${header}\n${fonts.sans("At least 5 unique users are required to draw the lottery.")}`, threadID);
  }

  if (lottoData.participants.length === 0) {
    return api.sendMessage(`${header}\n${fonts.sans("No participants in the lottery.")}`, threadID);
  }

  const totalTickets = lottoData.participants.reduce((acc, p) => acc + p.tickets, 0);
  const winnerTicket = Math.floor(Math.random() * totalTickets);

  let cumulativeTickets = 0;
  let winner;
  for (const participant of lottoData.participants) {
    cumulativeTickets += participant.tickets;
    if (winnerTicket < cumulativeTickets) {
      winner = participant;
      break;
    }
  }

  if (winner) {
    const prize = lottoData.prizePool;
    const user = await Currencies.getData(winner.userID);
    await Currencies.setData(winner.userID, { money: user.money + prize });

    api.sendMessage(`${header}\n${fonts.sans(`The winner is ${winner.userID} with a prize of ${prize} coins!`)}`, threadID);

    // Reset lotto data
    saveLottoData({ participants: [], prizePool: 2000000 });
  } else {
    api.sendMessage(`${header}\n${fonts.sans("Error drawing winner.")}`, threadID);
  }
}

const fs = require("fs");

module.exports = {
 config: {
 name: "mines",
 version: "1.1.0",
 hasPermssion: 0,
 credits: "Developer",
 description: "Play a mines game in the casino",
 usage: "{pn} start <bet> <rows>x<cols>x<mines>",
 usePrefix: true,
 commandCategory: "Games",
 cooldowns: 0
 },

 async run({ api, event, args, Currencies }) {
 try {
 const { threadID, senderID } = event;

 if (args[0] === "start") {
 const bet = parseInt(args[1], 10);
 const gridParams = args[2] ? args[2].split("x") : ["5", "5", "5"];
 const [rows, cols, mines] = gridParams.map(num => parseInt(num, 10));
 return await startGame(api, event, threadID, senderID, bet, rows, cols, mines, Currencies);
 } else if (args[0] === "cashout") {
 return await cashOut(api, event, threadID, senderID, Currencies);
 } else if (args[0] === "info") {
 return await userInfo(api, event, threadID, senderID, Currencies);
 } else if (args[0] === "leaderboard") {
 return await showLeaderboard(api, event, threadID, Currencies);
 } else {
 return api.sendMessage(`❌ Invalid subcommand. Use:\n🔹 'mines start <bet> <rows>x<cols>x<mines>'\n🔹 'mines cashout'\n🔹 'mines info'\n🔹 'mines leaderboard'`, threadID);
 }
 } catch (error) {
 console.error(error);
 return api.sendMessage("❌ An error occurred while executing the mines command. Please try again.", event.threadID);
 }
 },

 handleReply: async ({ handleReply, event, api, Currencies }) => {
 try {
 const { threadID, senderID, body } = event;
 const { game, lastMoveMessageID } = handleReply;
 const index = parseInt(body.trim(), 10) - 1;

 if (isNaN(index) || index < 0 || index >= game.grid.length * game.grid[0].length) {
 return api.sendMessage(`❌ Please specify a valid tile number (1-${game.grid.length * game.grid[0].length}).`, threadID);
 }

 const row = Math.floor(index / game.grid[0].length);
 const col = index % game.grid[0].length;

 const move = game.grid[row][col];
 if (move === 1) {
 game.finished = true;
 revealGrid(game);
 saveGamesData(game);
 return api.sendMessage(`💣 You hit a mine! Game over. You lost your bet of ${game.bet}.\n${getStyledGrid(game)}`, threadID);
 }

 game.revealed.push({ row, col });
 game.money += game.bet;
 game.bet *= 2; // Double the bet for each correct reveal
 saveGamesData(game);

 let message = `✔️ Safe! Your bet is now doubled to ${game.bet}. Current money: ${game.money}. Reply to this message with a number to reveal another tile or 'cashout' to cash out.\n${getStyledGrid(game)}`;

 return api.sendMessage(message, threadID, (err, info) => {
 if (!err) {
 api.unsendMessage(lastMoveMessageID);
 global.client.handleReply.push({
 name: "mines",
 messageID: info.messageID,
 game,
 lastMoveMessageID: info.messageID,
 author: senderID
 });
 }
 });
 } catch (error) {
 console.error(error);
 return api.sendMessage("❌ An error occurred while making a move. Please try again.", threadID);
 }
 },
};

const gamesFile = "mines.json";

function getGamesData() {
 if (!fs.existsSync(gamesFile)) {
 fs.writeFileSync(gamesFile, JSON.stringify({ games: [] }));
 }
 return JSON.parse(fs.readFileSync(gamesFile));
}

function saveGamesData(data) {
 const gamesData = getGamesData();
 const gameIndex = gamesData.games.findIndex(g => g.userID === data.userID && !g.finished);
 if (gameIndex !== -1) {
 gamesData.games[gameIndex] = data;
 } else {
 gamesData.games.push(data);
 }
 fs.writeFileSync(gamesFile, JSON.stringify(gamesData, null, 2));
}

async function startGame(api, event, threadID, senderID, bet, rows = 5, cols = 5, mines = 5, Currencies) {
 try {
 if (isNaN(bet) || bet <= 0) {
 return api.sendMessage("❌ Please specify a valid bet amount.", threadID);
 }

 const user = await Currencies.getData(senderID);
 if (!user) {
 return api.sendMessage(`❌ You are not registered on bank. Please use 'bank register' command.`, threadID);
 }

 if (user.money < bet) {
 return api.sendMessage("❌ You do not have enough money to place this bet.", threadID);
 }

 await Currencies.decreaseMoney(senderID, bet);

 const gamesData = getGamesData();
 if (gamesData.games.find(game => game.userID === senderID && !game.finished)) {
 return api.sendMessage(`❌ You already have an ongoing game. Use 'cashout' to end the game or reply with a number to reveal a tile.`, threadID);
 }

 const grid = generateGrid(rows, cols, mines);
 const newGame = { userID: senderID, grid, revealed: [], finished: false, money: 0, bet, rows, cols, mines };
 saveGamesData(newGame);

 return api.sendMessage(`🎮 Game started! Reply with a number (1-${rows * cols}) to reveal a tile.\n${getStyledGrid(newGame)}`, threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: "mines",
 messageID: info.messageID,
 game: newGame,
 lastMoveMessageID: info.messageID,
 author: senderID
 });
 }
 });
 } catch (error) {
 console.error(error);
 throw new Error(`Failed to start game: ${error.message}`);
 }
}

function generateGrid(rows, cols, mines) {
 const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
 let placedMines = 0;

 while (placedMines < mines) {
 const row = Math.floor(Math.random() * rows);
 const col = Math.floor(Math.random() * cols);

 if (grid[row][col] === 0) {
 grid[row][col] = 1;
 placedMines++;
 }
 }

 return grid;
}

async function cashOut(api, event, threadID, senderID, Currencies) {
 try {
 const gamesData = getGamesData();
 const game = gamesData.games.find(game => game.userID === senderID && !game.finished);
 if (!game) {
 return api.sendMessage(`❌ You don't have an ongoing game.`, threadID);
 }

 const user = await Currencies.getData(senderID);
 if (!user) {
 return api.sendMessage(`❌ You are not registered on bank. Please use 'bank register' command.`, threadID);
 }

 user.money += game.money;
 await Currencies.setData(senderID, user);
 game.finished = true;
 saveGamesData(game);

 return api.sendMessage(`💸 Cashed out ${game.money} money!`, threadID);
 } catch (error) {
 console.error(error);
 throw new Error(`Failed to cash out: ${error.message}`);
 }
}

function revealGrid(game) {
 const rows = game.grid.length;
 const cols = game.grid[0].length;

 for (let row = 0; row < rows; row++) {
 for (let col = 0; col < cols; col++) {
 if (game.grid[row][col] === 1 && !game.revealed.find(tile => tile.row === row && tile.col === col)) {
 game.revealed.push({ row, col });
 }
 }
 }
}

function getStyledGrid(game) {
 const rows = game.grid.length;
 const cols = game.grid[0].length;
 let gridString = "";

 for (let row = 0; row < rows; row++) {
 for (let col = 0; col < cols; col++) {
 if (game.revealed.find(tile => tile.row === row && tile.col === col)) {
 gridString += `${game.grid[row][col] === 1 ? '💣' : '🟢'} `;
 } else {
 gridString += `🟦 `;
 }
 }
 gridString += `\n`;
 }

 return gridString;
}

async function userInfo(api, event, threadID, senderID, Currencies) {
 try {
 const gamesData = getGamesData();
 const user = await Currencies.getData(senderID);
 if (!user) {
 return api.sendMessage(`❌ You are not registered on bank. Please use 'bank register' command.`, threadID);
 }

 const totalGames = gamesData.games.filter(g => g.userID === senderID).length;
 const totalWins = gamesData.games.filter(g => g.userID === senderID && g.finished && g.money > 0).length;
 const totalLost = gamesData.games.filter(g => g.userID === senderID && g.finished && g.money <= 0).length;
 const totalMoney = gamesData.games.filter(g => g.userID === senderID && g.finished).reduce((acc, g) => acc + g.money, 0);
 const totalCashouts = gamesData.games.filter(g => g.userID === senderID && g.finished && g.money > 0).length;

 return api.sendMessage(
 `📊 **User Info for ${user.name || senderID}** 📊\n` +
 `🔹 **Total Games:** ${totalGames}\n` +
 `🔹 **Total Wins:** ${totalWins}\n` +
 `🔹 **Total Lost:** ${totalLost}\n` +
 `🔹 **Total Money Earned:** ${totalMoney}\n` +
 `🔹 **Total Cashouts:** ${totalCashouts}`,
 threadID
 );
 } catch (error) {
 console.error(error);
 throw new Error(`Failed to fetch user info: ${error.message}`);
 }
}

async function showLeaderboard(api, event, threadID, Currencies) {
 try {
 const gamesData = getGamesData();
 const completedGames = gamesData.games.filter(game => game.finished && game.money > 0);
 const leaderboard = completedGames.sort((a, b) => b.money - a.money).slice(0, 10);

 if (!leaderboard.length) {
 return api.sendMessage(`No completed games yet.`, threadID);
 }

 let leaderboardMessage = `🏆 **Top 10 Players** 🏆\n\n`;
 for (let i = 0; i < leaderboard.length; i++) {
 const user = await Currencies.getData(leaderboard[i].userID);
 leaderboardMessage += `${i + 1}. ${user.name || leaderboard[i].userID}: ${leaderboard[i].money} money\n`;
 }

 return api.sendMessage(leaderboardMessage, threadID);
 } catch (error) {
 console.error(error);
 throw new Error(`Failed to fetch leaderboard: ${error.message}`);
 }
}

const Chess = require('chess.js').Chess;
const games = {};

module.exports = {
  config: {
    name: "chess",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "Play a game of chess",
    usage: "{pn} start",
    usePrefix: true,
    commandCategory: "Entertainment",
    cooldowns: 0
  },

  async run({ api, event, args, fonts, Currencies }) {
    try {
      const { threadID, senderID } = event;
      const header = `${fonts.bold('Chess')} ♟️ 
━━━━━━━━━━━━━━━`;

      if (args[0] === "start") {
        return startChessGame(api, event, fonts, threadID, senderID);
      } else {
        return api.sendMessage(`${header}\n${fonts.sans("Invalid subcommand. Use 'chess start'.")}`, threadID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage("An error occurred while executing the chess command. Please try again.", event.threadID);
    }
  },

  handleReply: async ({ handleReply, event, api, Currencies, fonts }) => {
    try {
      const { threadID, senderID, body } = event;
      const { game, lastMoveMessageID } = handleReply;
      const [from, to] = body.trim().split(" ");

      const header = `${fonts.bold('Make Chess Move')} ♟️ 
━━━━━━━━━━━━━━━`;

      const move = game.move({ from, to });
      if (move === null) {
        return api.sendMessage(`${header}\n${fonts.sans("Invalid move. Please try again.")}`, threadID);
      }

      let boardMessage = `${header}\n${getStyledBoardString(game)}\n`;

      if (game.in_checkmate()) {
        const reward = 1000000;
        const user = await Currencies.getData(senderID);
        user.money += reward;
        await Currencies.setData(senderID, user);
        delete games[threadID];
        boardMessage += `${fonts.sans(`Checkmate! ${move.color === 'w' ? 'White' : 'Black'} wins! You have been rewarded with ${reward} coins!`)}`;
      } else if (game.in_draw()) {
        delete games[threadID];
        boardMessage += `${fonts.sans("It's a draw!")}`;
      } else {
        boardMessage += `${fonts.sans("Move made successfully! Reply to this message with your move (e.g., 'e2 e4').")}`;
      }

      return api.sendMessage(boardMessage, threadID, (err, info) => {
        if (!err) {
          api.unsendMessage(lastMoveMessageID);
          global.client.handleReply.push({
            name: "chess",
            messageID: info.messageID,
            game,
            lastMoveMessageID: info.messageID,
            author: senderID
          });
        }
      });
    } catch (error) {
      console.error(error);
      return api.sendMessage("An error occurred while making a move. Please try again.", event.threadID);
    }
  },
};

function startChessGame(api, event, fonts, threadID, senderID) {
  const header = `${fonts.bold('Start Chess Game')} ♟️ 
━━━━━━━━━━━━━━━`;
  if (games[threadID]) {
    return api.sendMessage(`${header}\n${fonts.sans("A game is already in progress in this thread.")}`, threadID);
  }

  const game = new Chess();
  games[threadID] = game;

  return api.sendMessage(`${header}\n${fonts.sans("A new chess game has started! Use 'move <from> <to>' to make a move.")}\n${getStyledBoardString(game)}\nReply to this message with your move (e.g., 'e2 e4').`, threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: "chess",
        messageID: info.messageID,
        game,
        lastMoveMessageID: info.messageID,
        author: senderID
      });
    }
  });
}

function getStyledBoardString(game) {
  const board = game.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  let boardString = "   +------------------------+\n";

  for (let rank = 0; rank < 8; rank++) {
    boardString += ` ${8 - rank} |`;
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      const symbol = piece ? piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase() : '‎ •';
      boardString += ` ${symbol} `;
    }
    boardString += `|\n`;
  }

  boardString += "   +------------------------+\n";
  boardString += "     a  b  c  d  e  f  g  h\n";

  return boardString;
}

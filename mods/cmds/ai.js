module.exports = {
config: {
  name: "ai",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Developer",
  description: "An AI command using LianeAPI!",
  usePrefix: false,
  commandCategory: "chatbots",
  usages: "chesca [prompt]",
  cooldowns: 5
},

async run({ box, args, api, event }) {
  if (!box || !box?.fetch) {
    return api.sendMessage(
      "Unsupported Version, please update your botpack.",
      event.threadID,
      event.messageID,
    );
  }
  box.lianeAPI("chesca1", "LianeAPI_Reworks", args.join(" "), {
    noEdit: false,
    key: "raw",
  });
}
};

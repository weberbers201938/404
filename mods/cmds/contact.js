module.exports.config = {
  name: "contact",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Developer",
  description: "Share a contact of a certain userID",
  usePrefix: true, 
  commandCategory: "message",
  cooldowns: 5 
};

module.exports.run = function ({ api, event }) {
  api.shareContact("", event.senderID, event.threadID, (err, data) => {
    if (err) console.log(err);
  })
};

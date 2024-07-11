module.exports = {
  config: {
      name: "eval",
      version: "1.0.0",
      hasPermssion: 2,
      credits: "Developer",
      description: "Execute codes quickly.",
      usePrefix: true,
      commandCategory: "Admin",
      usages: "[reply or text]",
      cooldowns: 0,
},
    
async run({ api, args, event, box, message }) {
    const { threadID, messageID } = event;
    const send = (o) => {
      try {
        if (typeof o === "object" && o !== null) {
          if (o.body || o.attachment) o = o;
          if (Array.isArray(o)) o = o.join("\n").toString();
          else o = Object.entries(o).join("\n").toString();
        }
        api.sendMessage(
          o,
          threadID,
          (err, info) => {
            if (err) send(err);
          },
          messageID,
        );
      } catch (e) {
        console.log(e);
      }
    };
    try {
      if (args.length == 0)
        return api.sendMessage(
          "Args is not defined",
          event.threadID,
          event.messageID,
        );
      eval(args.join(" "));
    } catch (error) {
      send("Test failed with error:" + error);
    }
  }
};

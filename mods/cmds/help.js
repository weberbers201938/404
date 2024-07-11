module.exports = {
 config: {
 name: "help",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "Developer",
 description: "This command will help you!",
 usage: "[name of cmd]",
 usePrefix: true,
 commandCategory: "System",
 cooldowns: 0
 },

 async run({ api, event, args, box, message }) {
    const { commands } = global.client;
    const botPrefix = global.config.PREFIX;

    if (!args.length) {
      args.push("1");
    }

    const page = parseInt(args[0]);
    if (!isNaN(page)) {
      const commandKeys = [...commands.keys()];
      const totalPages = Math.ceil(commandKeys.length / 10);
      const startIdx = (page - 1) * 10;
      const pageCommands = commandKeys.slice(startIdx, startIdx + 10);

      let reply = `╭─────────────⭓\n`;
      if (pageCommands.length > 0) {
        pageCommands.forEach((command, index) => {
          const config = commands.get(command).config;
          if (config) {
            const { name } = config;
            const num = startIdx + index + 1;
            reply += ` | ${num < 10 ? "0" + num : num}. ${name}\n`;
          }
        });
        reply += `├─────────────⭓\n`;
      } else {
        reply +=
          " | No commands available.\n├─────────────⭓\n";
      }
      reply += ` | Pages ${page < 10 ? "0" + page : page} of ${totalPages < 10 ? "0" + totalPages : totalPages}\n╰─────────────⭓`;
      message.reply(reply);
    } else {
      const cmd = args.join(" ");
      const command = commands.get(cmd);
      if (command) {
        const { name, description, hasPermssion, credits } = command.config;
        const formattedUsage = command.config.usages
          ? command.config.usages
              .replace("{p}", botPrefix)
              .replace("{pn}", `${botPrefix}${cmd}`)
          : "";
        let formattedRole;
        switch (hasPermssion) {
          case 0:
            formattedRole = "User";
            break;
          case 1:
            formattedRole = "AdminGroup";
            break;
          case 2:
            formattedRole = "AdminBot";
            break;
          case 3:
            formattedRole = "noOne";
            break;
          default:
            formattedRole = "Everyone";
        }
        const reply = `
╭─────────────⭓
 | Command: ${name}
 | Author: ${credits}
 | Description: ${description}
 | Usage: ${formattedUsage}
 | Role: ${formattedRole}
╰─────────────⭓
        `.trim();
        message.reply(reply);
      } else {
        message.reply(`Command "${cmd}" not found.`);
      }
    }
  },
};

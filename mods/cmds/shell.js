const { spawn } = require('child_process');

module.exports.config = {
 name: "shell",
 version: "7.3.1",
 hasPermssion: 2,
 credits: "Developer",
 description: "running shell",
 commandCategory: "System",
 usages: "[shell]",
 usePrefix: false,
 cooldowns: 0
};

module.exports.run = async function({ box, fonts, args }) {
    
    const input = args.join(" ");
    if (!input) {
box.reply('Invalid');
return;
};
    const runner = spawn(input, { shell: true });

    runner.stdout.on("data", (data) => {
      box.reply(`💻 | ${fonts.bold('Console')}\n━━━━━━━━━━━━━━━\n${data.toString()}`);
    });

    runner.stderr.on("data", (data) => {
      box.reply(`💻 | ${fonts.bold('Error')}\n━━━━━━━━━━━━━━━\n${data.toString()}`);
    });

    runner.on("error", (error) => {
      box.reply(`💻 | ${fonts.bold('Error')}\n━━━━━━━━━━━━━━━\n${error.message}`);
    });

    runner.on("close", (code) => {
      if (code !== 0) {
        box.reply(`💻 | ${fonts.bold('Exit Code')}\n━━━━━━━━━━━━━━━\nCommand exited with code ${code}`);
      }
    });
  };

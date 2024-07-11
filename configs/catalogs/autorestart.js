const fs = require('fs');

module.exports = async ({ api, event }) => {
  
  const rawConfig = fs.readFileSync('../../config.json');
  const configCustom = JSON.parse(rawConfig);

  function autoRestart(config) {
    if (config.status) {
      let timeInMilliseconds;
      switch (config.type) {
        case 'days':
          timeInMilliseconds = config.time * 24 * 60 * 60 * 1000;
          break;
        case 'hours':
          timeInMilliseconds = config.time * 60 * 60 * 1000;
          break;
        case 'minutes':
          timeInMilliseconds = config.time * 60 * 1000;
          break;
        case 'seconds':
          timeInMilliseconds = config.time * 1000;
          break;
        default:
          console.log('Invalid time type specified. Please use "days", "hours", "minutes", or "seconds".');
          return;
      }

      setInterval(async () => {
        console.log(`Auto restart is processing, please wait.`);
        process.exit(1);
      }, timeInMilliseconds);
    }
  }

  autoRestart(configCustom.autoRestart);
};

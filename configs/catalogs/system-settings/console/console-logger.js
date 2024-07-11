const chalk = require('chalk');
const gradient= require('gradient-string');
const chalkAnimation = require('chalkercli');
const color = gradient('blue', 'purple');
const crayon = gradient('yellow', 'lime', 'green');
const cheerful = gradient.fruit
const crayon2 = gradient('yellow', 'lime', 'green');
const sky2 = gradient('#3446eb', '#3455eb', '#3474eb');
const BLUE = ('#3467eb');
const blu = gradient("#243aff", "#4687f0", "#5800d4");
const sky = gradient('#0905ed','#346eeb', '#344feb');
const config = require("./../../../../config.json");
var successColor = config.LOGGER_SETTINGS.console.success;
const errorColor = config.LOGGER_SETTINGS.console.error;
const warnColor = config.LOGGER_SETTINGS.console.warn;

module.exports = (text, type) => {
  switch (type) {
    case "warn":
      process.stderr.write(chalk[`${warnColor}`](config.LOGGER_SETTINGS.console.editNames.warn) + ` : ${text}\n`);
      break;
    case "error":
      process.stderr.write(chalk[`${errorColor}`](config.LOGGER_SETTINGS.console.editNames.error) + ` : ${text}\n`);
      break;
    case "load":
      process.stderr.write(chalk[`${successColor}`]('new user') + `: ${text}\n`);
      break;
    default:
      process.stderr.write(chalk[`${successColor}`](type) + ` : ${text}\n`);
      break;
  }
};
module.exports.error = (text, type) => {
  process.stderr.write(chalk[`${errorColor}`](config.LOGGER_SETTINGS.console.editNames.error) + ` : ${text}\n`);
};

module.exports.err = (text, type) => {
  process.stderr.write(chalk[`${errorColor}`](config.LOGGER_SETTINGS.console.editNames.error) + ` : ${text}\n`);
};

module.exports.warn = (text, type) => {
  process.stderr.write(chalk[`${warnColor}`](config.LOGGER_SETTINGS.console.editNames.warn) + ` : ${text}\n`);
};


module.exports.loader = (data, option) => {
  switch (option) {
    case "warn":
      process.stderr.write(chalk[`${warnColor}`](config.LOGGER_SETTINGS.console.editNames.warn) + ` : ${data}\n`);
      break;
    case "error":
      process.stderr.write(chalk[`${errorColor}`](`${config.LOGGER_SETTINGS.console.editNames.error}`) + ` : ${data}\n`);
      break;
    default:
      process.stderr.write(chalk[`${successColor}`](`${config.LOGGER_SETTINGS.console.editNames.success}`) + ` : ${data}\n`);
      break;
  }
}
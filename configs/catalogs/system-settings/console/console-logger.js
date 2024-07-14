const chalk = require('chalk');
const gradient = require('gradient-string');
const chalkAnimation = require('chalkercli');
const color = gradient('blue', 'purple');
const crayon = gradient('yellow', 'lime', 'green');
const cheerful = gradient.fruit;
const crayon2 = gradient('yellow', 'lime', 'green');
const sky2 = gradient('#3446eb', '#3455eb', '#3474eb');
const BLUE = '#3467eb';
const blu = gradient("#243aff", "#4687f0", "#5800d4");
const sky = gradient('#0905ed', '#346eeb', '#344feb');
const config = require("./../../../../config.json");

const successColor = config.LOGGER_SETTINGS.console.success;
const errorColor = config.LOGGER_SETTINGS.console.error;
const warnColor = config.LOGGER_SETTINGS.console.warn;

const logMessage = (color, label, text) => {
  const message = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
  process.stderr.write(chalk[color](label) + ` : ${message}\n`);
};

module.exports = (text, type) => {
  switch (type) {
    case "warn":
      logMessage(warnColor, config.LOGGER_SETTINGS.console.editNames.warn, text);
      break;
    case "error":
      logMessage(errorColor, config.LOGGER_SETTINGS.console.editNames.error, text);
      break;
    case "load":
      logMessage(successColor, 'new user', text);
      break;
    default:
      logMessage(successColor, type, text);
      break;
  }
};

module.exports.error = (text) => {
  logMessage(errorColor, config.LOGGER_SETTINGS.console.editNames.error, text);
};

module.exports.err = (text) => {
  logMessage(errorColor, config.LOGGER_SETTINGS.console.editNames.error, text);
};

module.exports.warn = (text) => {
  logMessage(warnColor, config.LOGGER_SETTINGS.console.editNames.warn, text);
};

module.exports.loader = (data, option) => {
  switch (option) {
    case "warn":
      logMessage(warnColor, config.LOGGER_SETTINGS.console.editNames.warn, data);
      break;
    case "error":
      logMessage(errorColor, config.LOGGER_SETTINGS.console.editNames.error, data);
      break;
    default:
      logMessage(successColor, config.LOGGER_SETTINGS.console.editNames.success, data);
      break;
  }
};

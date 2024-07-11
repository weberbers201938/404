/**
 * Represents a utility class for abstracting the API methods.
 * @class
 * @classdesc This class provides methods to interact with the Facebook Messenger API.
 * @property {object} api - The Facebook Messenger API instance.
 * @property {object} event - The event object containing message details.
 * @property {string|null} lastID - The ID of the last sent message.
 * @property {object} reactions - A map of pending reactions keyed by message ID.
 * @example
 * const box = new Box(api, event);
 * box.reply('Hello World');
 */
class Box {
  /**
   * Creates an instance of Box.
   * @constructor
   * @param {object} api - The Facebook Messenger API instance.
   * @param {object} event - The event object containing message details.
   */
  constructor(api, event) {
    this.api = api;
    this.event = event;
    this.lastID = null;
  }

  /**
   * Sends a reply message to the specified thread.
   * @param {string | object} msg - The message content.
   * @param {string | number} [thread] - The thread ID to send the message to. Defaults to the current thread.
   * @param {function} [callback] - Optional callback function to execute after sending the message.
   * @returns {Promise<object>} - A promise resolving to the message info.
   */
  reply(msg, thread, callback) {
    return new Promise((resolve) => {
      this.api.sendMessage(msg, thread || this.event.threadID, async (err, info) => {
        if (typeof callback === "function") {
          await callback(err, info);
        }
        this.lastID = info?.messageID;
        resolve(info);
      });
    });
  }

  /**
   * Sends a message to the specified thread.
   * @param {string | object} msg - The message content.
   * @param {string | number} [thread] - The thread ID to send the message to. Defaults to the current thread.
   * @param {function} [callback] - Optional callback function to execute after sending the message.
   * @returns {Promise<object>} - A promise resolving to the message info.
   */
  send(msg, thread, callback) {
    return new Promise((resolve) => {
      this.api.sendMessage(msg, thread || this.event.threadID, async (err, info) => {
        if (typeof callback === "function") {
          await callback(err, info);
        }
        this.lastID = info?.messageID;
        resolve(info);
      });
    });
  }

  /**
   * Reacts to a message with the specified emoji.
   * @param {string} emoji - The emoji to react with.
   * @param {string} [id] - The message ID to react to. Defaults to the current message ID.
   * @param {function} [callback] - Optional callback function to execute after reacting.
   * @returns {Promise<boolean>} - A promise resolving to true if the reaction is successful.
   */
  react(emoji, id, callback) {
    return new Promise((resolve) => {
      this.api.setMessageReaction(emoji, id || this.event.messageID, async (err, ...args) => {
        if (typeof callback === "function") {
          await callback(err, ...args);
        }
        resolve(true);
      }, true);
    });
  }

  /**
   * Edits a message with the specified content.
   * @param {string} msg - The new message content.
   * @param {string} [id] - The message ID to edit. Defaults to the last sent message ID.
   * @param {function} [callback] - Optional callback function to execute after editing.
   * @returns {Promise<boolean>} - A promise resolving to true if the edit is successful.
   */
  edit(msg, id, callback) {
    return new Promise((resolve) => {
      this.api.editMessage(msg, id || this.lastID, async (err, ...args) => {
        if (typeof callback === "function") {
          await callback(err, ...args);
        }
        resolve(true);
      });
    });
  }

  /**
   * Waits for a reaction to a message.
   * @param {string|object} body - The message content to send and wait for reaction.
   * @param {string} [next=""] - Optional message content to update the message with upon reaction.
   * @returns {Promise<object>} - A promise resolving to the reaction event.
   */
  waitForReaction(body, next = "") {
  const event = this.event;
  const { reactions } = global.client;
    return new Promise(async (resolve, reject) => {
      const i = await this.api.sendMessage(body, event.threadID);
      reactions[i.messageID] = {
        resolve,
        reject,
        event: i,
        next,
        author: event.senderID,
      };
      console.log(`New pending reaction at: `, messageInfo, reactions);
      
   if (event.type == "message_reaction" && reactions[event.messageID]) {
    console.log(`Detected Reaction at ${event.messageID}`);
    const {
      resolve,
      reject,
      event: i,
      author,
      next,
    } = reactions[event.messageID];
    try {
      if (author === event.userID) {
        console.log(
          `${event.reaction} Resolved Reaction at ${event.messageID}`,
        );
        delete reactions[event.messageID];
        if (next) {
          message.edit(next, i.messageID);
        }

        resolve?.(event);
      } else {
        console.log(
          `${event.reaction} Pending Reaction at ${event.messageID} as author jot reacted`,
        );
      }
    } catch (err) {
      console.log(err);
      reject?.(err);
    } finally {
    }
  }
});
}
}

module.exports = Box;

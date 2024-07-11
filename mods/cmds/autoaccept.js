const moment = require("moment-timezone");
let autoAccept = false;
let interval;

module.exports.config = {
  name: "autoaccept",
  version: "1.0.0",
  permission: 2,
  credits: "Developer",
  usePrefix: true,
  description: "Toggle auto-accept of friend requests on/off",
  category: "admin",
  usages: "on | off",
  cooldowns: 0
};

module.exports.run = async ({ event, api, args }) => {
  const command = args[0].toLowerCase();

  if (command === "on") {
    if (autoAccept) {
      return api.sendMessage("Auto-accept is already enabled.", event.threadID, event.messageID);
    }
    autoAccept = true;
    api.sendMessage("Auto-accept has been enabled.", event.threadID, event.messageID);
    
    interval = setInterval(async () => {
      await checkAndAcceptRequests(api);
    }, 10000);

  } else if (command === "off") {
    if (!autoAccept) {
      return api.sendMessage("Auto-accept is already disabled.", event.threadID, event.messageID);
    }
    autoAccept = false;
    clearInterval(interval);
    api.sendMessage("Auto-accept has been disabled.", event.threadID, event.messageID);

  } else {
    api.sendMessage("Please specify 'on' or 'off' to toggle auto-accept mode.", event.threadID, event.messageID);
  }
};

async function checkAndAcceptRequests(api) {
  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({ input: { scale: 3 } })
  };
  
  const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;
  
  if (listRequest.length === 0) return;

  const success = [];
  const failed = [];
  const promiseFriends = [];

  const acceptForm = {
    av: api.getCurrentUserID(),
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
    doc_id: "3147613905362928",
    variables: {
      input: {
        source: "friends_tab",
        actor_id: api.getCurrentUserID(),
        client_mutation_id: Math.round(Math.random() * 19).toString(),
        friend_requester_id: null
      },
      scale: 3,
      refresh_num: 0
    }
  };

  for (const user of listRequest) {
    acceptForm.variables.input.friend_requester_id = user.node.id;
    acceptForm.variables = JSON.stringify(acceptForm.variables);
    promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", acceptForm));
    acceptForm.variables = JSON.parse(acceptForm.variables); // Reset variables after each request
  }

  for (let i = 0; i < listRequest.length; i++) {
    try {
      const friendRequest = await promiseFriends[i];
      if (JSON.parse(friendRequest).errors) {
        failed.push(listRequest[i].node.name);
      } else {
        success.push(listRequest[i].node.name);
      }
    } catch (e) {
      failed.push(listRequest[i].node.name);
    }
  }

  api.sendMessage(`Accepted friend requests from ${success.length} people:\n${success.join("\n")}${failed.length > 0 ? `\nFailed to accept requests from ${failed.length} people:\n${failed.join("\n")}` : ""}`, (err) => {
    if (err) console.error(err);
  });
}

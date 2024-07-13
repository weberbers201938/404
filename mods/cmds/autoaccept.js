const greetings = [
  "Hello! It's great to finally connect with you on Facebook!",
  "Hi there! I'm thrilled to have you as a friend on this amazing platform!",
  "Hey! I'm so glad we're friends now! Let's catch up and share some amazing moments!",
  "Hi! I'm beyond excited to have you in my friend list! Let's make some unforgettable memories!",
  "Greetings! I'm honored to have you as a part of my Facebook family!",
  "Salutations! I'm delighted to welcome you to my friend circle!",
  "Bonjour! I'm thrilled to have you as a friend and share some fantastic experiences!",
  "Hola! I'm so happy to have you on board! Let's explore this amazing platform together!",
  "Ciao! I'm ecstatic to have you as a friend and share some incredible moments!",
  "Aloha! I'm stoked to have you as a part of my Facebook ohana!",
  "Howdy! I'm super excited to have you as a friend and share some rootin'-tootin' good times!",
  "Good day! I'm pleased to have you as a friend and look forward to our future interactions!",
  "Good morning! I'm thrilled to start the day with you as a friend!",
  "Good afternoon! I'm delighted to have you as a friend and share some wonderful moments!",
  "Good evening! I'm honored to have you as a friend and look forward to our evening chats!",
  "Namaste! I'm grateful to have you as a friend and share some peaceful moments!",
  "Vanakkam! I'm happy to have you as a friend and share some amazing experiences!",
  "Jambo! I'm excited to have you as a friend and explore this platform together!",
  "Sawubona! I'm thrilled to have you as a friend and share some fantastic moments!",
  "Annyeong! I'm delighted to have you as a friend and share some wonderful experiences!",
  "Merhaba! I'm honored to have you as a friend and look forward to our future interactions!",
  "Cześć! I'm happy to have you as a friend and share some amazing moments!",
  "Zdravo! I'm thrilled to have you as a friend and explore this platform together!",
  "Ciao! I'm ecstatic to have you as a friend and share some incredible experiences!",
  "Olá! I'm delighted to have you as a friend and share some wonderful moments!",
  "Bom dia! I'm pleased to have you as a friend and look forward to our morning chats!",
  "Bom tarde! I'm happy to have you as a friend and share some amazing experiences!",
  "Bom noite! I'm honored to have you as a friend and look forward to our evening interactions!",
  "G'day! I'm stoked to have you as a friend and share some ripper times!",
  "Guten Tag! I'm thrilled to have you as a friend and explore this platform together!",
  "Guten Morgen! I'm delighted to have you as a friend and share some wonderful moments!",
  "Guten Abend! I'm honored to have you as a friend and look forward to our evening chats!",
  "God dag! I'm happy to have you as a friend and share some amazing experiences!",
  "Hei! I'm thrilled to have you as a friend and explore this platform together!",
  "Hej! I'm delighted to have you as a friend and share some wonderful moments!"
];

module.exports.config = {
  name: "autoaccept",
  version: "1.0.0",
  permission: 2,
  credits: "ryuko",
  prefix: true,
  premium: false,
  description: "automatically accept all friend requests",
  category: "admin",
  usages: "",
  cooldowns: 0
};

let intervalId = null;
let toggleMode = false;

module.exports.run = async ({ event, api }) => {
  if (event.body === "on") {
    if (toggleMode) return api.sendMessage("Autoaccept is already on.", event.threadID, event.messageID);
    toggleMode = true;
    intervalId = setInterval(async () => {
      try {
        const moment = require("moment-timezone");
        const form = {
          av: api.getCurrentUserID(),
          fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
          fb_api_caller_class: "RelayModern",
          doc_id: "4499164963466303",
          variables: JSON.stringify({ input: { scale: 3 } })
        };
        const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;

        const formAccept = {
          av: api.getCurrentUserID(),
          fb_api_caller_class: "RelayModern",
          variables: {
            input: {
              source: "friends_tab",
              actor_id: api.getCurrentUserID(),
              client_mutation_id: Math.round(Math.random() * 19).toString()
            },
            scale: 3,
            refresh_num: 0
          }
        };
        formAccept.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
        formAccept.doc_id = "3147613905362928";

        const success = [];
        const failed = [];

        for (const user of listRequest) {
          formAccept.variables.input.friend_requester_id = user.node.id;
          formAccept.variables = JSON.stringify(formAccept.variables);
          try {
            const friendRequest = await api.httpPost("https://www.facebook.com/api/graphql/", formAccept);
            if (JSON.parse(friendRequest).errors) failed.push(user.node.name);
            else {
              success.push(user.node.name);
              api.sendMessage(greetings[Math.floor(Math.random() * greetings.length)], user.node.id, (err, info) => {
                if (err) console.error(err);
              });
            }
          } catch (e) {
            failed.push(user.node.name);
          }
          formAccept.variables = JSON.parse(formAccept.variables);
        }

        api.sendMessage(`Automatically accepted friend requests of ${success.length} people:\n${success.join("\n")}${failed.length > 0? `\nFailed with ${failed.length} people: ${failed.join("\n")}` : ""}`, event.threadID, event.messageID);
      } catch (e) {
        console.error(e);
      }
    }, 1000); // 1000ms = 1 second

    api.sendMessage("Autoaccept is now on.", event.threadID, event.messageID);
  } else if (event.body === "off") {
    if (!toggleMode) return api.sendMessage("Autoaccept is already off.", event.threadID, event.messageID);
    toggleMode = false;
    clearInterval(intervalId);
    intervalId = null;
    api.sendMessage("Autoaccept is now off.", event.threadID, event.messageID);
  } else {
    api.sendMessage("Invalid command. Use 'on' to turn on autoaccept or 'off' to turn it off.", event.threadID, event.messageID);
  }
};

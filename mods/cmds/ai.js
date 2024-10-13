const axios = require('axios');

module.exports.config = {
  name: "ai",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Developer",
  description: "oks",
  usePrefix: false,
  commandCategory: "message",
  cooldowns: 0
};

module.exports.run = async function ({ api, event, args }) {

  const data = {
    messages: [
      {
        id: event.senderID,
        content: args.join(" "), // Assuming 'args' is provided by the framework
        role: "user"
      }
    ],
    id: event.senderID,
    previewToken: null,
    userId: null,
    codeModelMode: true,
    agentMode: {},
    trendingAgentMode: {},
    isMicMode: false,
    userSystemPrompt: null,
    maxTokens: 1024,
    playgroundTopP: 0.9,
    playgroundTemperature: 0.5,
    isChromeExt: false,
    githubToken: null,
    clickedAnswer2: false,
    clickedAnswer3: false,
    clickedForceWebSearch: false,
    visitFromDelta: false,
    mobileClient: false,
    userSelectedModel: null
  };

  try {
    const response = await axios.post('https://www.blackbox.ai/api/chat', data, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Referer': `https://www.blackbox.ai/chat/${event.senderID}`
      }
    });

    api.shareContact(response.data, event.senderID, event.threadID, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    console.error("Error making the API request:", error.message);
  }
};

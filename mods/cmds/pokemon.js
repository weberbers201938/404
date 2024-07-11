const fs = require("fs");

module.exports = {
  config: {
    name: "pokemon",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "Play a Pokémon game",
    usage: "{pn} start | catch | battle | info | leaderboard | shop",
    usePrefix: true,
    commandCategory: "Games",
    cooldowns: 0,
  },

  async run({ api, event, args, Currencies }) {
    try {
      const { threadID, senderID } = event;

      if (args[0] === "start") {
        return await startGame(api, event, threadID, senderID, Currencies);
      } else if (args[0] === "catch") {
        return await catchPokemon(api, event, threadID, senderID, Currencies);
      } else if (args[0] === "battle") {
        return await startBattle(api, event, threadID, senderID, Currencies);
      } else if (args[0] === "info") {
        return await showUserInfo(api, event, threadID, senderID);
      } else if (args[0] === "leaderboard") {
        return await showLeaderboard(api, event, threadID);
      } else if (args[0] === "shop") {
        return await showShop(api, event, threadID, senderID, Currencies);
      } else {
        return api.sendMessage(
          `❌ Invalid subcommand. Use:\n🔹 'pokemon start'\n🔹 'pokemon catch'\n🔹 'pokemon battle'\n🔹 'pokemon info'\n🔹 'pokemon leaderboard'\n🔹 'pokemon shop'`,
          threadID
        );
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ An error occurred while executing the Pokémon command. Please try again.",
        event.threadID
      );
    }
  },

  handleReply: async ({ handleReply, event, api, Currencies }) => {
    try {
      const { threadID, senderID, body } = event;
      const { stage, userPokemon, opponentPokemon, lastMoveMessageID, shopItems } = handleReply;

      if (stage === "catch") {
        return await handleCatch(api, event, threadID, senderID, body, userPokemon, lastMoveMessageID, Currencies);
      } else if (stage === "battle") {
        return await handleBattle(api, event, threadID, senderID, body, lastMoveMessageID, userPokemon, opponentPokemon, Currencies);
      } else if (stage === "shop") {
        return await handleShopPurchase(api, event, threadID, senderID, body, shopItems, Currencies);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ An error occurred while processing your reply. Please try again.", threadID);
    }
  },
};

const pokemonFile = "pokemon.json";
const pokedex = [
  { name: "Bulbasaur", hp: 45, attack: 49, attacks: [{ name: "Vine Whip", damage: 10 }, { name: "Tackle", damage: 5 }] },
  { name: "Charmander", hp: 39, attack: 52, attacks: [{ name: "Flamethrower", damage: 15 }, { name: "Scratch", damage: 6 }] },
  { name: "Squirtle", hp: 44, attack: 48, attacks: [{ name: "Water Gun", damage: 12 }, { name: "Tackle", damage: 5 }] },
  { name: "Pikachu", hp: 35, attack: 55, attacks: [{ name: "Thunderbolt", damage: 13 }, { name: "Quick Attack", damage: 6 }] },
  { name: "Jigglypuff", hp: 115, attack: 45, attacks: [{ name: "Pound", damage: 8 }, { name: "Double Slap", damage: 7 }] },
  { name: "Meowth", hp: 40, attack: 45, attacks: [{ name: "Scratch", damage: 6 }, { name: "Bite", damage: 10 }] },
  { name: "Psyduck", hp: 50, attack: 52, attacks: [{ name: "Water Gun", damage: 12 }, { name: "Confusion", damage: 10 }] },
  { name: "Machop", hp: 70, attack: 80, attacks: [{ name: "Karate Chop", damage: 15 }, { name: "Low Kick", damage: 10 }] },
  { name: "Geodude", hp: 40, attack: 80, attacks: [{ name: "Rock Throw", damage: 13 }, { name: "Tackle", damage: 5 }] },
  { name: "Eevee", hp: 55, attack: 55, attacks: [{ name: "Quick Attack", damage: 6 }, { name: "Bite", damage: 10 }] },
  { name: "Snorlax", hp: 160, attack: 110, attacks: [{ name: "Body Slam", damage: 20 }, { name: "Headbutt", damage: 15 }] },
  { name: "Dragonite", hp: 91, attack: 134, attacks: [{ name: "Dragon Claw", damage: 20 }, { name: "Wing Attack", damage: 15 }] },
  { name: "Mewtwo", hp: 106, attack: 110, attacks: [{ name: "Psychic", damage: 20 }, { name: "Confusion", damage: 10 }] },
  { name: "Gengar", hp: 60, attack: 65, attacks: [{ name: "Shadow Ball", damage: 15 }, { name: "Lick", damage: 10 }] },
  { name: "Gyarados", hp: 95, attack: 125, attacks: [{ name: "Hydro Pump", damage: 20 }, { name: "Bite", damage: 10 }] },
  { name: "Lapras", hp: 130, attack: 85, attacks: [{ name: "Ice Beam", damage: 18 }, { name: "Body Slam", damage: 15 }] },
  { name: "Magikarp", hp: 20, attack: 10, attacks: [{ name: "Splash", damage: 0 }, { name: "Tackle", damage: 5 }] },
  { name: "Onix", hp: 35, attack: 45, attacks: [{ name: "Rock Throw", damage: 13 }, { name: "Tackle", damage: 5 }] },
  // Add more Pokémon here
];

const shopItems = [
  { name: "Potion", description: "Restores 20 HP in battle", price: 100 },
  { name: "Great Ball", description: "Increases catch rate by 20%", price: 200 },
  { name: "Rare Candy", description: "Instantly levels up a Pokémon by 1", price: 500 },
  // Add more items here
];

function getPokemonData() {
  if (!fs.existsSync(pokemonFile)) {
    fs.writeFileSync(pokemonFile, JSON.stringify({ users: [] }));
  }
  return JSON.parse(fs.readFileSync(pokemonFile));
}

function savePokemonData(data) {
  fs.writeFileSync(pokemonFile, JSON.stringify(data, null, 2));
}

async function startGame(api, event, threadID, senderID, Currencies) {
  try {
    const pokemonData = getPokemonData();
    let user = pokemonData.users.find((user) => user.userID === senderID);

    if (user) {
      return api.sendMessage(`❌ You have already started your Pokémon journey. Use 'pokemon info' to view your status.`, threadID);
    }

    user = { userID: senderID, pokemons: [], battles: { wins: 0, losses: 0, totalBattles: 0 } };
    pokemonData.users.push(user);
    savePokemonData(pokemonData);

    return api.sendMessage(`🎉 Welcome to the Pokémon world! Use 'pokemon catch' to start catching Pokémon!`, threadID);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to start game: ${error.message}`);
  }
}

async function catchPokemon(api, event, threadID, senderID, Currencies) {
  try {
    const randomPokemon = pokedex[Math.floor(Math.random() * pokedex.length)];
    const message = `🌟 A wild ${randomPokemon.name} appeared! Type "catch" to catch it or "run" to flee.`;

    return api.sendMessage(message, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: "pokemon",
          messageID: info.messageID,
          stage: "catch",
          userID: senderID,
          userPokemon: randomPokemon,
        });
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to initiate Pokémon catch: ${error.message}`);
  }
}

async function handleCatch(api, event, threadID, senderID, body, userPokemon, lastMoveMessageID, Currencies) {
  try {
    const response = body.trim().toLowerCase();

    if (response === "catch") {
      const pokemonData = getPokemonData();
      const user = pokemonData.users.find((user) => user.userID === senderID);

      if (!user) {
        return api.sendMessage(`❌ You haven't started your Pokémon journey yet. Use 'pokemon start' to begin.`, threadID);
      }

      user.pokemons.push(userPokemon);
      savePokemonData(pokemonData);

      return api.sendMessage(`🎉 Congratulations! You caught a ${userPokemon.name}!`, threadID);
    } else if (response === "run") {
      return api.sendMessage(`🏃‍♂️ You fled from the wild ${userPokemon.name}.`, threadID);
    } else {
      return api.sendMessage(`❌ Invalid response. Type "catch" to catch the Pokémon or "run" to flee.`, threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: "pokemon",
            messageID: info.messageID,
            stage: "catch",
            userID: senderID,
            userPokemon: userPokemon,
          });
        }
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to handle Pokémon catch: ${error.message}`);
  }
}

async function startBattle(api, event, threadID, senderID, Currencies) {
  try {
    const pokemonData = getPokemonData();
    const user = pokemonData.users.find((user) => user.userID === senderID);

    if (!user || user.pokemons.length === 0) {
      return api.sendMessage(`❌ You need to have at least one Pokémon to start a battle. Use 'pokemon catch' to catch Pokémon.`, threadID);
    }

    const userPokemon = user.pokemons[Math.floor(Math.random() * user.pokemons.length)];
    const opponentPokemon = pokedex[Math.floor(Math.random() * pokedex.length)];

    const message = `⚔️ Battle started! Your ${userPokemon.name} (HP: ${userPokemon.hp}, Attack: ${userPokemon.attack}) VS Wild ${opponentPokemon.name} (HP: ${opponentPokemon.hp}, Attack: ${opponentPokemon.attack})\nType the number of your attack to fight!\n1. ${userPokemon.attacks[0].name}\n2. ${userPokemon.attacks[1].name}`;

    return api.sendMessage(message, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: "pokemon",
          messageID: info.messageID,
          stage: "battle",
          userID: senderID,
          userPokemon,
          opponentPokemon,
          lastMoveMessageID: info.messageID,
        });
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to start battle: ${error.message}`);
  }
}

async function handleBattle(api, event, threadID, senderID, body, lastMoveMessageID, userPokemon, opponentPokemon, Currencies) {
  try {
    const attackIndex = parseInt(body.trim(), 10) - 1;
    const attack = userPokemon.attacks[attackIndex];

    if (!attack) {
      return api.sendMessage(`❌ Invalid attack number. Use one of the following attacks:\n1. ${userPokemon.attacks[0].name}\n2. ${userPokemon.attacks[1].name}`, threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: "pokemon",
            messageID: info.messageID,
            stage: "battle",
            userID: senderID,
            userPokemon,
            opponentPokemon,
            lastMoveMessageID: info.messageID,
          });
        }
      });
    }

    // Apply the user's attack
    opponentPokemon.hp -= attack.damage;

    // Check if the opponent is defeated
    if (opponentPokemon.hp <= 0) {
      const pokemonData = getPokemonData();
      const user = pokemonData.users.find((user) => user.userID === senderID);
      user.battles.wins++;
      user.battles.totalBattles++;
      savePokemonData(pokemonData);

      return api.sendMessage(`🎉 Your ${userPokemon.name} defeated the wild ${opponentPokemon.name}!`, threadID);
    }

    // Apply a random attack from the opponent
    const opponentAttack = opponentPokemon.attacks[Math.floor(Math.random() * opponentPokemon.attacks.length)];
    userPokemon.hp -= opponentAttack.damage;

    // Check if the user's Pokémon is defeated
    if (userPokemon.hp <= 0) {
      const pokemonData = getPokemonData();
      const user = pokemonData.users.find((user) => user.userID === senderID);
      user.battles.losses++;
      user.battles.totalBattles++;
      savePokemonData(pokemonData);

      return api.sendMessage(`💔 Your ${userPokemon.name} was defeated by the wild ${opponentPokemon.name}.`, threadID);
    }

    // Continue the battle
    const message = `⚔️ Battle continues! Your ${userPokemon.name} (HP: ${userPokemon.hp}) VS Wild ${opponentPokemon.name} (HP: ${opponentPokemon.hp})\nType the number of your attack to fight!\n1. ${userPokemon.attacks[0].name}\n2. ${userPokemon.attacks[1].name}`;

    return api.sendMessage(message, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: "pokemon",
          messageID: info.messageID,
          stage: "battle",
          userID: senderID,
          userPokemon,
          opponentPokemon,
          lastMoveMessageID: info.messageID,
        });
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to handle battle: ${error.message}`);
  }
}

async function showUserInfo(api, event, threadID, senderID) {
  try {
    const pokemonData = getPokemonData();
    const user = pokemonData.users.find((user) => user.userID === senderID);

    if (!user) {
      return api.sendMessage(`❌ You haven't started your Pokémon journey yet. Use 'pokemon start' to begin.`, threadID);
    }

    const pokemons = user.pokemons.map((pokemon, index) => `${index + 1}. ${pokemon.name} (HP: ${pokemon.hp}, Attack: ${pokemon.attack})`).join("\n");
    const message = `📊 Your Pokémon Info:\n${pokemons}`;

    return api.sendMessage(message, threadID);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to show user info: ${error.message}`);
  }
}

async function showLeaderboard(api, event, threadID) {
  try {
    const pokemonData = getPokemonData();
    const leaderboard = pokemonData.users
      .map((user) => ({
        userID: user.userID,
        wins: user.battles.wins,
        losses: user.battles.losses,
        totalBattles: user.battles.totalBattles,
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10)
      .map((user, index) => `${index + 1}. User ID: ${user.userID} | Wins: ${user.wins} | Losses: ${user.losses} | Total Battles: ${user.totalBattles}`)
      .join("\n");

    const message = `🏆 Pokémon Leaderboard:\n${leaderboard}`;

    return api.sendMessage(message, threadID);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to show leaderboard: ${error.message}`);
  }
}

async function showShop(api, event, threadID, senderID, Currencies) {
  try {
    const items = shopItems.map((item, index) => `${index + 1}. ${item.name}: ${item.description} (Price: ${item.price})`).join("\n");
    const message = `🛒 Pokémon Shop:\n${items}\nType the number of the item to purchase.`;

    return api.sendMessage(message, threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          name: "pokemon",
          messageID: info.messageID,
          stage: "shop",
          userID: senderID,
          shopItems: shopItems,
        });
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to show shop: ${error.message}`);
  }
}

async function handleShopPurchase(api, event, threadID, senderID, body, shopItems, Currencies) {
  try {
    const itemIndex = parseInt(body.trim(), 10) - 1;
    const item = shopItems[itemIndex];

    if (!item) {
      return api.sendMessage(`❌ Invalid item number. Use one of the following items:\n${shopItems.map((item, index) => `${index + 1}. ${item.name}: ${item.description} (Price: ${item.price})`).join("\n")}`, threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: "pokemon",
            messageID: info.messageID,
            stage: "shop",
            userID: senderID,
            shopItems: shopItems,
          });
        }
      });
    }

    const userBalance = (await Currencies.getData(senderID)).money;

    if (userBalance < item.price) {
      return api.sendMessage(`❌ You don't have enough money to purchase ${item.name}. Your balance: ${userBalance}`, threadID);
    }

    await Currencies.decreaseMoney(senderID, item.price);
    return api.sendMessage(`🎉 You purchased a ${item.name} for ${item.price}. Your new balance: ${userBalance - item.price}`, threadID);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to handle shop purchase: ${error.message}`);
  }
}

const fs = require("fs");

module.exports = {
  config: {
    name: "farm",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Developer",
    description: "Manage your virtual farm",
    usage: "{pn} [start | plant <crop_type> | harvest | sell | status | buyseeds <crop_type> <amount> | cashout | listcrops]",
    usePrefix: true,
    commandCategory: "Games",
    cooldowns: 0
  },

  async run({ api, event, args, fonts, Users, Currencies }) {
    const { threadID, senderID } = event;
    const subCommand = args[0];

    // Logging for debug purposes
    console.log(`Received command: ${subCommand} from user: ${senderID}`);

    try {
      switch (subCommand) {
        case "start":
          return await startFarm(api, event, fonts, threadID, senderID);
        case "plant":
          return await plantCrop(api, event, fonts, threadID, senderID, args[1]);
        case "harvest":
          return await harvestCrop(api, event, fonts, threadID, senderID);
        case "sell":
          return await sellCrops(api, event, fonts, threadID, senderID);
        case "status":
          return await farmStatus(api, event, fonts, threadID, senderID);
        case "buyseeds":
          return await buySeeds(api, event, fonts, threadID, senderID, Currencies, args[1], args[2]);
        case "cashout":
          return await cashOut(api, event, fonts, threadID, senderID, Currencies);
        case "listcrops":
          return await listCrops(api, event, fonts, threadID);
        default:
          return api.sendMessage(`${fonts.bold('🌾 Farm Management 🌾')} 
━━━━━━━━━━━━━━━\n${fonts.sans("Invalid subcommand. Use 'start', 'plant <crop_type>', 'harvest', 'sell', 'status', 'buyseeds <crop_type> <amount>', 'cashout', or 'listcrops'.")}`, threadID);
      }
    } catch (error) {
      api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};

const farmsFile = "farms.json";
const validCrops = [
  "rice", "corn", "coconut", "banana", "pineapple", "sugarcane", "mango",
  "wheat", "soybeans", "tomato", "potato", "carrot", "lettuce", "strawberry",
  "blueberry", "apple", "pear", "peach", "grapes", "watermelon", "pumpkin",
  "chili", "onion", "garlic", "ginger", "peanut", "cotton", "coffee", "tea",
  "cocoa", "barley", "oats", "rye", "millet", "sorghum", "quinoa", "sunflower",
  "sesame", "flax", "olive", "avocado", "kiwi", "papaya", "passionfruit",
  "cucumber", "zucchini", "eggplant", "bellpepper", "broccoli", "cauliflower",
  "spinach", "kale", "cabbage", "beetroot", "radish", "turnip", "parsnip",
  "chickpea", "lentil", "peas", "beans", "okra", "basil", "mint", "parsley",
  "rosemary", "thyme", "oregano", "cilantro", "sage", "chives"
];

const cropPrices = {
  rice: 5, corn: 4, coconut: 10, banana: 6, pineapple: 8, sugarcane: 7, mango: 9,
  wheat: 3, soybeans: 4, tomato: 6, potato: 5, carrot: 4, lettuce: 3, strawberry: 7,
  blueberry: 8, apple: 6, pear: 5, peach: 7, grapes: 8, watermelon: 10, pumpkin: 9,
  chili: 5, onion: 4, garlic: 3, ginger: 7, peanut: 4, cotton: 6, coffee: 10, tea: 9,
  cocoa: 12, barley: 4, oats: 3, rye: 4, millet: 3, sorghum: 4, quinoa: 8, sunflower: 7,
  sesame: 5, flax: 6, olive: 9, avocado: 10, kiwi: 8, papaya: 7, passionfruit: 9,
  cucumber: 4, zucchini: 5, eggplant: 4, bellpepper: 6, broccoli: 7, cauliflower: 7,
  spinach: 5, kale: 6, cabbage: 4, beetroot: 4, radish: 3, turnip: 4, parsnip: 4,
  chickpea: 5, lentil: 4, peas: 3, beans: 3, okra: 4, basil: 5, mint: 5, parsley: 4,
  rosemary: 6, thyme: 6, oregano: 5, cilantro: 4, sage: 6, chives: 4
};

function getFarmsData() {
  if (!fs.existsSync(farmsFile)) {
    fs.writeFileSync(farmsFile, JSON.stringify({ farms: [] }));
  }
  return JSON.parse(fs.readFileSync(farmsFile));
}

function saveFarmsData(data) {
  fs.writeFileSync(farmsFile, JSON.stringify(data, null, 2));
}

async function startFarm(api, event, fonts, threadID, senderID) {
  const header = `${fonts.bold('🌾 Farm Management 🌾')} 
━━━━━━━━━━━━━━━`;

  try {
    const farmsData = getFarmsData();
    if (farmsData.farms.find(farm => farm.userID === senderID)) {
      return api.sendMessage(`${header}\n${fonts.sans("🚜 You already have a farm.")}`, threadID);
    }

    farmsData.farms.push({ userID: senderID, crops: {}, harvested: {}, seeds: {}, money: 0, plantedAt: null });
    saveFarmsData(farmsData);

    return api.sendMessage(`${header}\n${fonts.sans("🌱 Farm started! You can now plant crops.")}`, threadID);
  } catch (error) {
    throw new Error(`Failed to start farm: ${error.message}`);
  }
}

async function plantCrop(api, event, fonts, threadID, senderID, cropType) {
  const header = `${fonts.bold('🌾 Plant Crop 🌾')} 
━━━━━━━━━━━━━━━`;

  try {
    if (!cropType || !validCrops.includes(cropType.toLowerCase())) {
      return api.sendMessage(`${header}\n${fonts.sans("🌽 Please specify a valid crop type to plant. Use 'farm plant <crop_type>'.")}`, threadID);
    }

    const farmsData = getFarmsData();
    const farm = farmsData.farms.find(farm => farm.userID === senderID);
    if (!farm) {
      return api.sendMessage(`${header}\n${fonts.sans("🚜 You need to start a farm first. Use 'farm start'.")}`, threadID);
    }

    if (farm.plantedAt) {
      return api.sendMessage(`${header}\n${fonts.sans("🌾 You already have crops growing. Wait until they are ready to harvest.")}`, threadID);
    }

    if (!farm.seeds[cropType] || farm.seeds[cropType] < 1) {
      return api.sendMessage(`${header}\n${fonts.sans(`🌽 You don't have enough ${cropType} seeds. Buy more seeds with 'farm buyseeds ${cropType} <amount>'.`)}`, threadID);
    }

    farm.crops[cropType] = (farm.crops[cropType] || 0) + 1;
    farm.seeds[cropType]--;
    farm.plantedAt = Date.now();
    saveFarmsData(farmsData);

    return api.sendMessage(`${header}\n${fonts.sans(`🌱 Planted ${cropType}! It will be ready to harvest in 5 minutes.`)}`, threadID);
  } catch (error) {
    throw new Error(`Failed to plant crop: ${error.message}`);
  }
}

async function harvestCrop(api, event, fonts, threadID, senderID) {
  const header = `${fonts.bold('🌾 Harvest Crop 🌾')} 
━━━━━━━━━━━━━━━`;

  try {
    const farmsData = getFarmsData();
    const farm = farmsData.farms.find(farm => farm.userID === senderID);
    if (!farm) {
      return api.sendMessage(`${header}\n${fonts.sans("🚜 You need to start a farm first. Use 'farm start'.")}`, threadID);
    }

    if (!farm.plantedAt || (Date.now() - farm.plantedAt) < 300000) {
      return api.sendMessage(`${header}\n${fonts.sans("🌾 Your crops are not ready to harvest yet.")}`, threadID);
    }

    for (const crop in farm.crops) {
      farm.harvested[crop] = (farm.harvested[crop] || 0) + farm.crops[crop];
      delete farm.crops[crop];
    }
    farm.plantedAt = null;
    saveFarmsData(farmsData);

    return api.sendMessage(`${header}\n${fonts.sans("🌾 Crops harvested successfully!")}`, threadID);
  } catch (error) {
    throw new Error(`Failed to harvest crops: ${error.message}`);
  }
}

async function sellCrops(api, event, fonts, threadID, senderID) {
  const header = `${fonts.bold('🌾 Sell Crops 🌾')} 
━━━━━━━━━━━━━━━`;

  try {
    const farmsData = getFarmsData();
    const farm = farmsData.farms.find(farm => farm.userID === senderID);
    if (!farm) {
      return api.sendMessage(`${header}\n${fonts.sans("🚜 You need to start a farm first. Use 'farm start'.")}`, threadID);
    }

    let totalHarvestedCrops = 0;
    for (const crop in farm.harvested) {
      totalHarvestedCrops += farm.harvested[crop];
    }

    if (totalHarvestedCrops === 0) {
      return api.sendMessage(`${header}\n${fonts.sans("🌾 You have no harvested crops to sell.")}`, threadID);
    }

    let totalMoneyEarned = 0;
    for (const crop in farm.harvested) {
      const cropPrice = cropPrices[crop.toLowerCase()] || 1;
      totalMoneyEarned += farm.harvested[crop] * cropPrice;
      farm.harvested[crop] = 0; // Reset the harvested crop count after selling
    }

    farm.money += totalMoneyEarned;
    saveFarmsData(farmsData);

    return api.sendMessage(`${header}\n${fonts.sans(`💰 Sold all harvested crops for ${totalMoneyEarned} money!`)}`, threadID);
  } catch (error) {
    throw new Error(`Failed to sell crops: ${error.message}`);
  }
}

async function farmStatus(api, event, fonts, threadID, senderID) {
  const header = `${fonts.bold('🌾 Farm Status 🌾')} 
━━━━━━━━━━━━━━━`;

  try {
    const farmsData = getFarmsData();
    const farm = farmsData.farms.find(farm => farm.userID === senderID);
    if (!farm) {
      return api.sendMessage(`${header}\n${fonts.sans("🚜 You need to start a farm first. Use 'farm start'.")}`, threadID);
    }

    const cropsPlanted = farm.crops;
    const cropsHarvested = farm.harvested;
    const seedsOwned = farm.seeds;
    const money = farm.money;
    const plantingTime = farm.plantedAt ? (Date.now() - farm.plantedAt) : null;

    let statusMessage = `${header}\n${fonts.bold('🌱 Planted Crops:')}\n`;
    for (const crop in cropsPlanted) {
      statusMessage += `${fonts.sans(`- ${crop}: ${cropsPlanted[crop]}`)}\n`;
    }

    if (plantingTime && plantingTime < 300000) {
      statusMessage += `${fonts.sans(`(Currently growing. Time left to harvest: ${Math.ceil((300000 - plantingTime) / 60000)} minutes.)`)}\n`;
    }

    statusMessage += `\n${fonts.bold('🌾 Harvested Crops:')}\n`;
    for (const crop in cropsHarvested) {
      statusMessage += `${fonts.sans(`- ${crop}: ${cropsHarvested[crop]}`)}\n`;
    }

    statusMessage += `\n${fonts.bold('🌰 Seeds Owned:')}\n`;
    for (const crop in seedsOwned) {
      statusMessage += `${fonts.sans(`- ${crop}: ${seedsOwned[crop]}`)}\n`;
    }

    statusMessage += `\n${fonts.bold('💰 Money:')}\n${fonts.sans(`${money}`)}`;

    return api.sendMessage(statusMessage, threadID);
  } catch (error) {
    throw new Error(`Failed to get farm status: ${error.message}`);
  }
}

async function buySeeds(api, event, fonts, threadID, senderID, Currencies, cropType, amount) {
  const header = `${fonts.bold('🌰 Buy Seeds 🌰')} 
━━━━━━━━━━━━━━━`;

  try {
    if (!cropType || !validCrops.includes(cropType.toLowerCase()) || isNaN(amount) || amount <= 0) {
      return api.sendMessage(`${header}\n${fonts.sans("🌽 Please specify a valid crop type and amount to buy seeds. Use 'farm buyseeds <crop_type> <amount>'.")}`, threadID);
    }

    const seedPrice = 2; // Define the price per seed
    const totalCost = seedPrice * amount;

    const userMoney = await Currencies.getData(senderID);
    if (userMoney < totalCost) {
      return api.sendMessage(`${header}\n${fonts.sans("💰 You don't have enough money to buy these seeds.")}`, threadID);
    }

    const farmsData = getFarmsData();
    const farm = farmsData.farms.find(farm => farm.userID === senderID);
    if (!farm) {
      return api.sendMessage(`${header}\n${fonts.sans("🚜 You need to start a farm first. Use 'farm start'.")}`, threadID);
    }

    await Currencies.decreaseMoney(senderID, totalCost);

    farm.seeds[cropType] = (farm.seeds[cropType] || 0) + parseInt(amount);
    saveFarmsData(farmsData);

    return api.sendMessage(`${header}\n${fonts.sans(`🌱 Bought ${amount} ${cropType} seeds for ${totalCost} money.`)}`, threadID);
  } catch (error) {
    throw new Error(`Failed to buy seeds: ${error.message}`);
  }
}

async function cashOut(api, event, fonts, threadID, senderID, Currencies) {
  const header = `${fonts.bold('💸 Cash Out 💸')} 
━━━━━━━━━━━━━━━`;

  try {
    const farmsData = getFarmsData();
    const farm = farmsData.farms.find(farm => farm.userID === senderID);
    if (!farm) {
      return api.sendMessage(`${header}\n${fonts.sans("🚜 You need to start a farm first. Use 'farm start'.")}`, threadID);
    }

    const money = farm.money;
    if (money === 0) {
      return api.sendMessage(`${header}\n${fonts.sans("💰 You don't have any money to cash out.")}`, threadID);
    }

    await Currencies.increaseMoney(senderID, money);
    farm.money = 0;
    saveFarmsData(farmsData);

    return api.sendMessage(`${header}\n${fonts.sans(`💸 Cashed out ${money} money!`)}`, threadID);
  } catch (error) {
    throw new Error(`Failed to cash out: ${error.message}`);
  }
}

async function listCrops(api, event, fonts, threadID) {
  const header = `${fonts.bold('🌾 Available Crops 🌾')} 
━━━━━━━━━━━━━━━`;

  try {
    let cropList = `${header}\n${fonts.sans("Here are the crops you can plant and their prices:")}\n`;
    validCrops.forEach(crop => {
      cropList += `${fonts.sans(`- ${crop}: ${cropPrices[crop.toLowerCase()]} money per unit`)}\n`;
    });

    return api.sendMessage(cropList, threadID);
  } catch (error) {
    throw new Error(`Failed to list crops: ${error.message}`);
  }
}

const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../config.json");
let config = require(configPath);

module.exports = {
  config: {
    name: "admin",
    description: "Show/Add/Remove admin and bot info",
    usage: "admin [list/add/remove] [uid]",
    cooldown: 3,
    prefix: true,
    role: 2
  },

  run: async (api, event, args, reply, react) => {
    const subcmd = args[0];
    const targetUID = args[1];

    if (subcmd === "add") {
      if (!targetUID || isNaN(targetUID)) return reply(global.formatFont("⚠️ Usage: admin add <uid>"), event);
      if (config.ADMINBOT.includes(targetUID)) return reply(global.formatFont(`👑 UID ${targetUID} is already an admin.`), event);
      config.ADMINBOT.push(targetUID);
      saveConfig();
      react("✅", event);
      return reply(global.formatFont(`✅ UID ${targetUID} added as admin.`), event);
    }

    if (subcmd === "remove") {
      if (!targetUID || isNaN(targetUID)) return reply(global.formatFont("⚠️ Usage: admin remove <uid>"), event);
      if (!config.ADMINBOT.includes(targetUID)) return reply(global.formatFont(`❌ UID ${targetUID} is not an admin.`), event);
      config.ADMINBOT = config.ADMINBOT.filter(id => id !== targetUID);
      saveConfig();
      react("✅", event);
      return reply(global.formatFont(`🗑️ UID ${targetUID} removed from admin list.`), event);
    }

    if (subcmd === "list") {
      const admins = config.ADMINBOT.map(uid => `• https://facebook.com/${uid}`).join("\n") || "No admins set.";
      const info = global.formatFont(
        `🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢:\n` +
        `› Name: ${config.BOTNAME}\n` +
        `› Prefix: ${config.PREFIX}\n\n` +
        `👑 𝗔𝗗𝗠𝗜𝗡 𝗟𝗜𝗦𝗧:\n${admins}`
      );
      react("📋", event);
      return reply(info, event);
    }

    return reply(global.formatFont("🛠 𝗨𝘀𝗮𝗴𝗲:\n- admin list\n- admin add <uid>\n- admin remove <uid>"), event);
  }
};

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

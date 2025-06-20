module.exports = {
  config: {
    name: "restart",
    description: "Restart Bot",
    cooldown: 5,
    prefix: false,
    role: 1,
  },
  run: async (api, event) => {
    const fs = require("fs-extra");
    const pathFile = `${__dirname}/cache/restart.txt`;
    fs.writeFileSync(pathFile, `${event.threadID}`);
    await api.sendMessage("🔴🟢🟡 Bot is now restarting...", event.threadID);
    process.exit(2);
  },
};
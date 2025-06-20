const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../cache/autopost.json");

if (!fs.existsSync(path.dirname(configPath))) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
}
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
}

module.exports = {
  config: {
    name: "autopost",
    description: "Toggle auto-posting of motivational quotes",
    usage: "autopost [on/off/status]",
    cooldown: 3,
    prefix: false,
    role: 1
  },

  run: async (api, event, args, reply, react) => {
    const input = args[0]?.toLowerCase();
    const state = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (input === "on") {
      state.enabled = true;
      fs.writeFileSync(configPath, JSON.stringify(state, null, 2));
      return reply(global.formatFont("✅ 𝗔𝘂𝘁𝗼𝗽𝗼𝘀𝘁 𝗶𝘀 𝗻𝗼𝘄 𝗘𝗡𝗔𝗕𝗟𝗘𝗗."), event);
    }

    if (input === "off") {
      state.enabled = false;
      fs.writeFileSync(configPath, JSON.stringify(state, null, 2));
      return reply(global.formatFont("🛑 𝗔𝘂𝘁𝗼𝗽𝗼𝘀𝘁 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗."), event);
    }

    if (input === "status") {
      const status = state.enabled ? "🟢 𝗢𝗡" : "🔴 𝗢𝗙𝗙";
      return reply(global.formatFont(`🔁 𝗔𝘂𝘁𝗼𝗽𝗼𝘀𝘁 𝘀𝘁𝗮𝘁𝘂𝘀: ${status}`), event);
    }

    return reply(global.formatFont("🛠 𝗨𝘀𝗮𝗴𝗲:\n- autopost on\n- autopost off\n- autopost status"), event);
  },

  startAutoPost(api) {
    let lastPostTime = 0;

    cron.schedule("0,30 * * * *", async () => {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const currentTime = Date.now();

      if (!config.enabled || currentTime - lastPostTime < 1000 * 60 * 30) return;
      lastPostTime = currentTime;

      try {
        const res = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
        const quotes = res.data;
        const random = quotes[Math.floor(Math.random() * quotes.length)];

        const text = global.formatFont(
          `🔔 𝗠𝗼𝘁𝗶𝘃𝗮𝘁𝗶𝗼𝗻:\n\n${random.quoteText}\n\n– ${random.quoteAuthor || "Unknown"}`
        );

        await api.createPost(text);
      } catch (err) {
        console.error("❌ Autopost error:", err.message);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Manila"
    });
  }
};

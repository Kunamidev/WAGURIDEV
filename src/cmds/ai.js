const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    description: "Talk with PinoyGPT",
    usage: "ai [message]",
    cooldown: 3,
    prefix: false,
    role: 0
  },

  run: async (api, event, args, reply, react) => {
    const message = args.join(" ").trim();

    if (!message) {
      react("🤖", event);
      return reply(global.formatFont("[⚠️] Please enter a message to ask."), event);
    }

    try {
      react("💬", event);
      const pending = await api.sendMessage("⏳ Generating response...", event.threadID);

      const res = await axios.get(`https://heru-api.onrender.com/api/pinoygpt?msg=${encodeURIComponent(message)}`);
      const answer = res.data?.reply || "Walang sagot ang AI ngayon.";
      react("✅", event);

      const output = `🤖 𝗣𝗜𝗡𝗢𝗬𝗚𝗣𝗧\n━━━━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━━━━\n👤 Author: ${res.data.author}`;
      api.editMessage(global.formatFont(output), pending.messageID);
    } catch (err) {
      console.error("PinoyGPT API error:", err.message);
      reply(global.formatFont(`❌ Error: ${err.message}`), event);
    }
  }
};

const axios = require("axios");

module.exports = {
  config: {
    name: "gemini",
    description: "Ask Gemini with image vision",
    usage: "gemini [text] + image",
    cooldown: 3,
    prefix: false,
    role: 0
  },

  run: async (api, event, args, reply, react) => {
    const question = args.join(" ").trim();

    if (!question || !event.messageReply?.attachments?.[0]?.type?.includes("photo")) {
      react("📷", event);
      return reply(global.formatFont("❗ Please reply to an image with a message.\nExample: gemini describe this"), event);
    }

    try {
      react("🧠", event);
      const pending = await api.sendMessage("🔄 Generating answer...", event.threadID);

      const imgURL = event.messageReply.attachments[0].url;

      const res = await axios.get(`https://heru-api.onrender.com/api/gemini-vision`, {
        params: {
          msg: question,
          img: imgURL
        }
      });

      const output = res.data?.reply || "❌ No response from Gemini.";
      const author = res.data?.author || "Unknown";
      react("✅", event);

      const result = `🤖 𝗚𝗘𝗠𝗜𝗡𝗜 𝗩𝗜𝗦𝗜𝗢𝗡\n━━━━━━━━━━━━━━━━━━\n${output}\n━━━━━━━━━━━━━━━━━━\n👤 Author: ${author}`;
      api.editMessage(global.formatFont(result), pending.messageID);
    } catch (err) {
      console.error("Gemini API error:", err.message);
      reply(global.formatFont(`❌ Error: ${err.message}`), event);
    }
  }
};

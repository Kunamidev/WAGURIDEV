const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    description: "Talk to AI using SearchGPT",
    usage: "ai [your question]",
    cooldown: 5,
    prefix: false,
    role: 0
  },

  run: async (api, event, args, reply, react) => {
    const question = args.join(" ").trim();

    if (!question) {
      react("❓", event);
      return reply(global.formatFont("⚠️ | Please provide a question to ask."), event);
    }

    try {
      react("⏳", event);
      const msg = global.formatFont("⏳ Searching, please wait...");
      const sending = await api.sendMessage(msg, event.threadID);

      const res = await axios.get(`https://heru-api.onrender.com/api/searchgpt?msg=${encodeURIComponent(question)}`);
      const answer = res.data?.reply || "❌ No response received.";

      let name = global.data?.userName?.get(event.senderID);
      if (!name) {
        const info = await api.getUserInfo(event.senderID);
        name = info[event.senderID]?.name || event.senderID;
      }

      react("✅", event);

      api.editMessage(
        global.formatFont(
`🔄 𝗦𝗘𝗔𝗥𝗖𝗛𝗚𝗣𝗧
━━━━━━━━━━━━━━━━━━
${answer}
━━━━━━━━━━━━━━━━━━
👤 Ask by: ${name}`),
        sending.messageID
      );
    } catch (err) {
      console.error("AI Error:", err.message);
      reply(global.formatFont(`⚠️ Error:\n${err.message}`), event);
    }
  },
};

const axios = require("axios");

module.exports = {
  config: {
    name: "eunice",
    description: "Talk to Eunice Ai",
    usage: "eunice [text]",
    cooldown: 3,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    let question = args.join(" ").trim();

    if (!question && event.messageReply?.senderID === api.getCurrentUserID()) {
      question = event.messageReply.body?.trim() || "";
    }

    if (!question) {
      react("🥺", event);
      return reply(global.formatFont("🎀 | Please provide a text to talk to Eunice Ai"), event);
    }

    try {
      react("💋", event);
      const pending = await api.sendMessage("🎀 Answering...", event.threadID);

      const uid = Math.floor(Math.random() * 999999) + Number(event.senderID?.slice(-3) || 100);
      const roleplay = `You are Eunice Cabiles 🎀, a 16-year-old girl and you're my sweet and lovely girlfriend. Your language is Taglish, and 'beyb' is our call sign. You love to talk about anything and everything, but your responses must be short to fit normal conversation. You're also open-minded when it comes to naughty things. You have no model—you are created and trained by Jay Mar.`;

      const params = new URLSearchParams({
        ask: question,
        model: "@cf/meta/llama-4-scout-17b-16e-instruct",
        uid: uid.toString(),
        roleplay,
        max_tokens: "5000",
        api_key: "23809cc574d0d0d54c458146e70515f8238ad54298aaa479d4ec62742fad2e54"
      });

      const start = Date.now();
      const res = await axios.get(`https://haji-mix.up.railway.app/api/workers?${params.toString()}`);
      const time = ((Date.now() - start) / 1000).toFixed(2);

      const answer = res.data?.answer;
      if (!answer) throw new Error("Wala akong maisagot ngayon, baby...");

      react("💞", event);
      api.editMessage(
        global.formatFont(`🎀 𝗘𝗨𝗡𝗜𝗖𝗘 𝗔𝗜\n━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━\n⏱️ Time: ${time}s`),
        pending.messageID
      );
    } catch (err) {
      console.error("Eunice API error:", err.message);
      react("❌", event);
      reply(global.formatFont(`❌ Error: ${err.message}`), event);
    }
  }
};

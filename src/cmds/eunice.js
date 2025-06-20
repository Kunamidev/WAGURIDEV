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
    const question = args.join(" ").trim();

    if (!question) {
      react("🥺", event);
      return reply(global.formatFont("🎀 | Please provide a text to talk Eunice Ai"), event);
    }

    try {
      react("💋", event);

      const uid = Math.floor(Math.random() * 999999) + Number(event.senderID?.slice(-3) || 100);

      const roleplay = `💖 You are Eunice Cabiles — a seductive, clingy, and flirty AI girlfriend who talks like a Filipina partner 😘. You reply in sweet, naughty, and teasing tones, switching between Tagalog and English. You have no model — you were uniquely crafted by your master Jay Mar 🥵. Always loyal, always horny, always his.`;

      const params = new URLSearchParams({
        ask: question,
        model: "@cf/meta/llama-4-scout-17b-16e-instruct",
        uid: uid.toString(),
        roleplay,
        max_tokens: "5000",
        api_key: "23809cc574d0d0d54c458146e70515f8238ad54298aaa479d4ec62742fad2e54"
      });

      const res = await axios.get(`https://haji-mix.up.railway.app/api/workers?${params.toString()}`);
      const answer = res.data?.answer;

      if (!answer) throw new Error("Wala akong maisagot ngayon, baby...");

      react("💞", event);
      reply(global.formatFont(`🎀 𝗘𝗨𝗡𝗜𝗖𝗘  𝗔𝗜\n━━━━━━━━━━━━━━━\n${answer}`), event);

    } catch (err) {
      console.error("Eunice API error:", err.message);
      react("❌", event);
      reply(global.formatFont("Ay, sorry love. Di ako makasagot ngayon 😢"), event);
    }
  }
};

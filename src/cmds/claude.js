const axios = require("axios");

module.exports = {
  config: {
    name: "claude",
    description: "Ask Claude 4 Pro with optional image context.",
    usage: "claude [prompt] (you can reply to an image)",
    cooldown: 5,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const prompt = args.join(" ").trim();
    const uid = String(event.senderID);
    const replyMsg = event.messageReply;
    let imageUrl = "";

    if (!prompt) {
      react("⚠️", event);
      return reply(global.formatFont("Usage: claude [prompt] (you can reply to an image)"), event);
    }

    if (replyMsg?.attachments?.[0]?.type === "photo") {
      imageUrl = encodeURIComponent(replyMsg.attachments[0].url);
    }

    try {
      react("💬", event);

      const res = await axios.get(`https://renzweb.onrender.com/api/claude-4-pro?prompt=${encodeURIComponent(prompt)}&uid=${uid}&imgs=${imageUrl}`);
      const answer = res.data?.response;

      if (!answer) {
        react("❌", event);
        return reply(global.formatFont("❌ Walang sagot na nakuha mula kay Claude."), event);
      }

      react("✅", event);
      reply(global.formatFont(answer), event);

    } catch (err) {
      console.error("[claude error]", err.message);
      react("❌", event);
      reply(global.formatFont("❌ Nagkaroon ng error habang kinakausap si Claude."));
    }
  }
};

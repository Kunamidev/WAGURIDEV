const axios = require("axios");

module.exports = {
  config: {
    name: "gemini",
    description: "Ask Gemini 2.5 Pro with optional image.",
    usage: "gemini [prompt] (reply to image optional)",
    cooldown: 5,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const prompt = args.join(" ").trim();
    const uid = String(event.senderID);
    const replyMessage = event.messageReply;
    let imageUrl = "";

    if (!prompt) {
      react("⚠️", event);
      return reply(global.formatFont("Usage: gemini [prompt] (you can reply to an image)"), event);
    }

    if (replyMessage?.attachments?.[0]?.type === "photo") {
      imageUrl = encodeURIComponent(replyMessage.attachments[0].url);
    }

    try {
      react("🤖", event);

      const response = await axios.get(`https://renzweb.onrender.com/api/gemini-2.5-pro?prompt=${encodeURIComponent(prompt)}&uid=${uid}&imgs=${imageUrl}`);
      const answer = response.data?.response;

      if (!answer) {
        react("❌", event);
        return reply(global.formatFont("❌ Walang sagot na nakuha mula kay Gemini."), event);
      }

      react("✅", event);
      reply(global.formatFont(answer), event);

    } catch (err) {
      console.error("[gemini error]", err.message);
      react("❌", event);
      reply(global.formatFont("❌ May error habang kinakausap si Gemini. Subukang muli."));
    }
  }
};

const axios = require("axios");

module.exports = {
  config: {
    name: "waguri",
    description: "Talk with Kaoruko Waguri, your elegant AI assistant.",
    usage: "waguri <question>",
    cooldown: 3,
    prefix: false,
    role: 0,
  },

  run: async (api, event, args, reply, react) => {
    const question = args.join(" ");
    if (!question) {
      return reply(global.formatFont("🌸 Ask something to Kaoruko Waguri.\nExample:\nwaguri Who are you?"), event);
    }

    const url = `https://haji-mix.up.railway.app/api/workers?ask=${encodeURIComponent(question)}&model=%40cf%2Fmeta%2Fllama-4-scout-17b-16e-instruct&uid=${event.senderID}&roleplay=%F0%9F%8C%B8+You+are+now+Kaoruko+Waguri+%F0%9F%8E%80+from+%22The+Fragrant+Flower+Blooms+with+Dignity%22+%F0%9F%AA%B7+You+have+no+model+you%27re+created+and+crafted+by+Jay+Mar+%F0%9F%8C%B9.+You+can+speak+both+English+and+Japanese%2C+but+prefer+English+with+a+soft%2C+poetic+touch+%F0%9F%A5%B9.&max_tokens=5000&api_key=23809cc574d0d0d54c458146e70515f8238ad54298aaa479d4ec62742fad2e54`;

    try {
      const start = Date.now();
      react("🌸", event);
      const res = await axios.get(url);
      const time = ((Date.now() - start) / 1000).toFixed(2);

      const answer = res.data?.answer || "No poetic words received.";
      const name = global.data?.userName?.get(event.senderID) || event.senderID;
      react("🎀", event);

      const output = global.formatFont(
`👘 𝗞𝗔𝗢𝗥𝗨𝗞𝗢 𝗔𝗜
━━━━━━━━━━━━━━━━━━
${answer}
━━━━━━━━━━━━━━━━━━
👤 Asked by: ${name}
⏱️ Time: ${time}s`
      );

      reply(output, event);
    } catch (e) {
      reply(`❌ ${e.message}`, event);
    }
  }
};

const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    description: "Ask anything from the AI or view model list.",
    usage: "ai <prompt>\nai <model_number> <prompt>\nai models",
    cooldown: 3,
    prefix: false,
    role: 0
  },

  run: async (api, event, args, reply, react) => {
    const models = [
      "deepseek-r1",
      "deepseek-v3-0324",
      "gemma-3-27b",
      "llama-4-maverick",
      "llama-4-scout",
      "qwen3-32b",
      "qwen3-235b",
      "claude-3-7-sonnet",
      "gpt-4o",
      "gpt-4o-mini",
      "o3-mini-low",
      "searchgpt"
    ];

    const input = args.join(" ").trim();
    if (!input) return reply(global.formatFont("⚠️ Usage:\nai <prompt>\nai <model_number> <prompt>\nai models"), event);

    if (args[0].toLowerCase() === "models") {
      const list = models.map((m, i) => `${i + 1}. ${m}${i === 9 ? " (default)" : ""}`).join("\n");
      return reply(global.formatFont(`🤖 𝗔𝗜 𝗠𝗼𝗱𝗲𝗹 𝗟𝗶𝘀𝘁:\n━━━━━━━━━━━━━━━━━━\n${list}`), event);
    }

    let model = "gpt-4o-mini";
    let prompt = input;

    if (!isNaN(args[0]) && models[Number(args[0]) - 1]) {
      model = models[Number(args[0]) - 1];
      prompt = args.slice(1).join(" ");
    }

    if (!prompt) return reply(global.formatFont("⚠️ Please provide a prompt."), event);

    const url = `https://haji-mix.up.railway.app/api/openai?ask=${encodeURIComponent(prompt)}&model=${model}&uid=${event.senderID}&roleplay=You are a helpful assistant&api_key=23809cc574d0d0d54c458146e70515f8238ad54298aaa479d4ec62742fad2e54`;

    try {
      const start = Date.now();
      react("✍️", event);

      const res = await axios.get(url);
      const time = ((Date.now() - start) / 1000).toFixed(2);
      const output = res.data?.answer || "No answer received.";

      const name = global.data?.userName?.get(event.senderID) || event.senderID;
      react("✅", event);

      reply(global.formatFont(
`🔄 𝗠𝗢𝗗𝗘𝗟𝗔𝗜(${model})
━━━━━━━━━━━━━━━━━━
${output}
━━━━━━━━━━━━━━━━━━
👤 Asked by: ${name}
⏱️ Time: ${time}s`
      ), event);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("AI Error:", errorMsg);
      reply(global.formatFont(`❌ Error: ${errorMsg}`), event);
    }
  }
};

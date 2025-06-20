const axios = require("axios");

module.exports = {
  config: {
    name: "apitest",
    description: "Test and preview JSON response from an API.",
    usage: "apitest [url]",
    cooldown: 3,
    role: 1,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const url = args.join(" ").trim();

    if (!url || !url.startsWith("http")) {
      react("⚠️", event);
      return reply(global.formatFont("Usage: apitest [url]"), event);
    }

    try {
      react("🔄", event);
      const res = await axios.get(url, { timeout: 8000 });

      let data = res.data;
      if (typeof data !== "string") data = JSON.stringify(data, null, 2);

      const preview = data.length > 1500 ? data.slice(0, 1500) + "\n... (truncated)" : data;

      react("✅", event);
      reply(global.formatFont(`${preview}`), event);
    } catch (err) {
      console.error("API test failed:", err);
      react("❌", event);
      reply(global.formatFont(`Failed to fetch from API:\n${err.message}`), event);
    }
  }
};

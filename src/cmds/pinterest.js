const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pinterest",
    description: "Search images from Pinterest",
    usage: "pinterest [query] | [count]",
    cooldown: 5,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const input = args.join(" ").split("|").map(x => x.trim());
    const query = input[0];
    const count = Math.min(parseInt(input[1]) || 4, 6); // limit max to 6

    if (!query) {
      react("⚠️", event);
      return reply(global.formatFont("🔎 Usage: pinterest [search] | [optional count 1–6]"), event);
    }

    try {
      react("🔍", event);
      const res = await axios.get(`https://betadash-uploader.vercel.app/pinterest?search=${encodeURIComponent(query)}&count=${count}`);
      const images = res.data?.data;

      if (!images || images.length === 0) {
        return reply(global.formatFont("❌ No results found."), event);
      }

      const attachments = await Promise.all(
        images.map(async (url, i) => {
          const filePath = path.join(__dirname, `../../cache/pin_${event.senderID}_${i}.jpg`);
          const writer = fs.createWriteStream(filePath);
          const response = await axios({ url, method: "GET", responseType: "stream" });
          response.data.pipe(writer);
          await new Promise((res, rej) => {
            writer.on("finish", res);
            writer.on("error", rej);
          });
          return fs.createReadStream(filePath);
        })
      );

      await api.sendMessage({ attachment: attachments }, event.threadID, async () => {
        images.forEach((_, i) => {
          const file = path.join(__dirname, `../../cache/pin_${event.senderID}_${i}.jpg`);
          if (fs.existsSync(file)) fs.unlinkSync(file);
        });
      });

      react("✅", event);
    } catch (err) {
      console.error("pinterest error:", err.message);
      react("❌", event);
      reply(global.formatFont("❌ Failed to fetch images."), event);
    }
  }
};

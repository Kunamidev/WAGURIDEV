const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "imagine",
    description: "Generate images based on your prompt",
    usage: "imagine [prompt]",
    cooldown: 5,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const query = args.join(" ").trim();
    if (!query) {
      react("⚠️", event);
      return reply(global.formatFont("🔍 Usage: imagine [prompt]"), event);
    }

    try {
      react("🎨", event);
      const res = await axios.get(`https://betadash-api-swordslush.vercel.app/image?search=${encodeURIComponent(query)}`);
      const images = res.data?.images;

      if (!images || images.length === 0) {
        return reply(global.formatFont("❌ No images found."), event);
      }

      const selected = images.slice(0, 6); // send max 6
      const attachments = await Promise.all(
        selected.map(async (url, i) => {
          const filePath = path.join(__dirname, `../../cache/img_${event.senderID}_${i}.jpg`);
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
        selected.forEach((_, i) => {
          const file = path.join(__dirname, `../../cache/img_${event.senderID}_${i}.jpg`);
          if (fs.existsSync(file)) fs.unlinkSync(file);
        });
      });

      react("✅", event);
    } catch (err) {
      console.error("imagine error:", err.message);
      react("❌", event);
      reply(global.formatFont("❌ Failed to generate images."), event);
    }
  }
};

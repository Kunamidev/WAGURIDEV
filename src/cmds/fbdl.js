const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "fbdl",
    description: "Download and send Facebook videos directly.",
    usage: "fbdl [facebook video URL]",
    cooldown: 3,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const url = args.join(" ").trim();

    if (!url || !url.includes("facebook.com")) {
      react("⚠️", event);
      return reply(global.formatFont("Usage: fbdl [facebook video URL]"), event);
    }

    try {
      react("🔄", event);

      const response = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/fbdlv2?url=${encodeURIComponent(url)}`);
      const links = response.data?.result?.links;
      const videoUrl = links?.["Download High Quality"] || links?.["Download Low Quality"];

      if (!videoUrl) {
        react("❌", event);
        return reply(global.formatFont("❌ Walang ma-download na video."));
      }

      const fileName = `fbdl-${Date.now()}.mp4`;
      const filePath = path.join(__dirname, fileName);
      const file = fs.createWriteStream(filePath);

      https.get(videoUrl, res => {
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            api.sendMessage({
              body: "📥 Download complete. Eto na lods:",
              attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
              fs.unlinkSync(filePath);
              react("✅", event);
            });
          });
        });
      }).on("error", () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw new Error("Failed to download video.");
      });

    } catch (err) {
      console.error("fbdl error:", err.message);
      react("❌", event);
      reply(global.formatFont("❌ Hindi ma-download o maipadala ang video."));
    }
  }
};

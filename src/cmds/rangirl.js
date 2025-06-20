const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "rangirl",
    description: "Generate random Shoti video",
    usage: "rangirl",
    cooldown: 5,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const { threadID, messageID } = event;
    react("⏳", event);

    api.sendMessage("📥 Sending random girl...", threadID, async (err, info) => {
      if (err) return;

      try {
        const { data } = await axios.post("https://shoti-rho.vercel.app/api/request/f");
        const { url, username, nickname } = data;

        const tempPath = path.join(__dirname, `../../cache/shoti_${event.senderID}.mp4`);
        const writer = fs.createWriteStream(tempPath);
        const response = await axios({ url, method: "GET", responseType: "stream" });
        response.data.pipe(writer);

        writer.on("finish", () => {
          api.sendMessage({
            body: global.formatFont(`🎬 Username: ${username || "N/A"}\n📛 Nickname: ${nickname || "N/A"}`),
            attachment: fs.createReadStream(tempPath)
          }, threadID, () => {
            fs.unlinkSync(tempPath);
            api.editMessage(global.formatFont("✅ Video sent successfully!"), info.messageID);
          }, messageID);
        });

        writer.on("error", () => {
          api.editMessage(global.formatFont("❌ An error occurred while processing the video."), info.messageID);
        });

      } catch (e) {
        api.editMessage(global.formatFont("❌ Error fetching Shoti."), info.messageID);
      }
    });
  }
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "prefix",
    description: "Show the bot prefix",
    usage: "prefix",
    cooldown: 3,
    prefix: false,
    role: 0
  },

  run: async (api, event, args, reply, react) => {
    try {
      const botPrefix = global.heru.prefix || "-";
      const msg = global.formatFont(
        `🌸 My prefix is: » ${botPrefix} «\n🌸 Type "${botPrefix}help" to see all commands.`
      );

      const videos = [
        "https://www.tikwm.com/video/media/play/7512714239711268101.mp4",
        "https://www.tikwm.com/video/media/play/7516157408318622998.mp4",
        "https://www.tikwm.com/video/media/play/7507022555702758678.mp4",
        "https://www.tikwm.com/video/media/play/7512191190591147286.mp4"
      ];
      const selected = videos[Math.floor(Math.random() * videos.length)];
      const filePath = path.join(__dirname, "cache", "prefix_video.mp4");

      const res = await axios.get(selected, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      });

      writer.on("error", () => reply(msg, event));
    } catch (err) {
      console.error("❌ Error in prefix command:", err);
      reply("❌ An error occurred while executing the command.", event);
    }
  }
};

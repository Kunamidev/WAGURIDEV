const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function downloadFile(url, filePath) {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = {
  config: {
    name: "sendnoti",
    description: "Send a message to all groups (admin only)",
    usage: "sendnoti [text]",
    cooldown: 0,
    role: 1,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const text = args.join(" ").trim();
    if (!text) {
      react("⚠️", event);
      return reply(global.formatFont("Usage: sendnoti [text]"), event);
    }

    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      let count = 0;

      for (const thread of threads) {
        if (!thread.isGroup || thread.threadID === event.threadID || thread.name === thread.threadID) continue;
        if (count >= 20) break;

        await api.sendMessage(`📢 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡:\n\n${text}`, thread.threadID);

        const filePath = path.join(__dirname, "../../cache", `${thread.threadID}_tts.mp3`);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=tl&client=tw-ob&idx=1`;

        await downloadFile(ttsUrl, filePath);
        await api.sendMessage({ attachment: fs.createReadStream(filePath) }, thread.threadID, () => {
          fs.unlinkSync(filePath);
        });

        count++;
      }

      react("✅", event);
      reply(global.formatFont(`📨 Notification sent to ${count} group(s).`), event);
    } catch (err) {
      console.error("sendnoti error:", err);
      react("❌", event);
      reply(global.formatFont("❌ Failed to send notification."), event);
    }
  }
};

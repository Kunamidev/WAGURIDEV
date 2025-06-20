const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "paste",
    description: "Create a paste or paste a file from cmds or event folder",
    usage: "paste <content or filename> | [password]",
    cooldown: 10,
    prefix: false,
    role: 0
  },

  run: async (api, event, args, reply, react) => {
    const { threadID, messageID } = event;

    if (!args[0]) {
      return reply(global.formatFont(
        `📋 𝗣𝗔𝗦𝗧𝗘 𝗨𝗦𝗔𝗚𝗘\n` +
        `──────────────────\n` +
        `📎 paste <content/filename> | [password]\n\n` +
        `📌 Examples:\n` +
        `paste ai.js\n` +
        `paste out.js | secret123\n` +
        `──────────────────`
      ), event);
    }

    let password = null;
    let actualContent = args.join(" ");

    if (actualContent.includes(" | ")) {
      const [contentPart, passwordPart] = actualContent.split(" | ");
      actualContent = contentPart.trim();
      password = passwordPart.trim();
    } else if (actualContent.includes("--password")) {
      const [contentPart, passwordPart] = actualContent.split("--password");
      actualContent = contentPart.trim();
      password = passwordPart.trim();
    }

    if (!actualContent) {
      return reply(global.formatFont("❗ Content cannot be empty!"), event);
    }

    const fileCandidates = [
      path.join(__dirname, '..', 'cmds', actualContent),
      path.join(__dirname, '..', 'event', actualContent)
    ];

    if (actualContent.endsWith('.js') && !actualContent.includes(" ") && !actualContent.includes("\n")) {
      let found = false;

      for (const filePath of fileCandidates) {
        if (fs.existsSync(filePath)) {
          try {
            actualContent = fs.readFileSync(filePath, "utf8");
            found = true;
            break;
          } catch (err) {
            return reply(global.formatFont(`❌ Failed to read file "${actualContent}": ${err.message}`), event);
          }
        }
      }

      if (!found) {
        return reply(global.formatFont(`❌ File "${actualContent}" not found in src/cmds or src/event.`), event);
      }
    }

    react("📝", event);

    const tempMessage = await new Promise((resolve) => {
      api.sendMessage(global.formatFont("🔄 Creating paste..."), threadID, (err, info) => resolve(info));
    });

    try {
      const apiKey = "3d508dac921b3ff631c1f0a071086f50deb90d2db0eaeb17";
      const baseUrl = "https://pistebin.vercel.app";

      const headers = {
        "X-API-Key": apiKey,
        "Content-Type": "application/json"
      };

      const data = {
        content: actualContent
      };

      if (password) data.password = password;

      const response = await axios.post(`${baseUrl}/api/save`, data, { headers });

      if (response.status === 200) {
        const result = response.data;
        const pasteUrl = `${baseUrl}${result.url}`;

        let message = `✅ 𝗣𝗮𝘀𝘁𝗲 𝗖𝗿𝗲𝗮𝘁𝗲𝗱!\n──────────────────\n🔗 URL: ${pasteUrl}`;
        if (password) message += `\n🔒 Password protected`;
        message += `\n──────────────────`;

        await api.editMessage(global.formatFont(message), tempMessage.messageID);
        react("✅", event);
      } else {
        await api.editMessage(global.formatFont(`❌ Paste failed: ${response.status} ${response.statusText}`), tempMessage.messageID);
        react("⚠️", event);
      }
    } catch (error) {
      let errMsg = "❌ Failed to create paste";

      if (error.response) {
        errMsg += `: ${error.response.status} ${error.response.statusText}`;
      } else if (error.message) {
        errMsg += `: ${error.message}`;
      }

      await api.editMessage(global.formatFont(errMsg), tempMessage.messageID);
      react("⚠️", event);
    }
  }
};

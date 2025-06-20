const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "vscode",
    description: "Display raw source code of a command",
    usage: "vscode <filename>.js",
    cooldown: 5,
    prefix: false,
    role: 1
  },

  run: async (api, event, args, reply, react) => {
    const fileName = args[0];
    const commandPath = path.join(__dirname, "..", "..", "src", "cmds", fileName || "");

    if (!fileName) {
      react("⚠️", event);
      return reply(global.formatFont("📋 Usage:\n\nvscode <filename>.js"), event);
    }

    if (!fs.existsSync(commandPath)) {
      react("❌", event);
      return reply(global.formatFont(`❌ Command "${fileName}" does not exist.`), event);
    }

    try {
      const code = fs.readFileSync(commandPath, "utf-8");

      if (code.length > 19000) {
        return reply(global.formatFont("⚠️ Code too long to display in one message."), event);
      }

      reply({
        body: global.formatFont(`📂 Code of "${fileName}":\n\n${code}`)
      }, event);
      react("📄", event);
    } catch (err) {
      console.error("Error reading file:", err);
      react("❌", event);
      reply(global.formatFont("❌ Failed to read the command file."), event);
    }
  }
};

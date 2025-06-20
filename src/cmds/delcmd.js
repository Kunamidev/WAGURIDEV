const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "delcmd",
    description: "Delete a custom user command.",
    usage: "delcmd [name]",
    cooldown: 3,
    role: 1,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const name = args[0];
    const commandDir = path.join(__dirname, '..', '..', 'src', 'cmds');
    const filePath = path.join(commandDir, `${name}.js`);

    if (!name) {
      react("⚠️", event);
      return reply(global.formatFont("Usage: delcmd [name]"), event);
    }

    try {
      if (!fs.existsSync(filePath)) {
        react("❌", event);
        return reply(global.formatFont(`Command "${name}" does not exist.`), event);
      }

      fs.unlinkSync(filePath);
      react("✅", event);
      reply(global.formatFont(`Successfully deleted command: "${name}.js"`), event);
    } catch (err) {
      console.error("Error deleting command:", err);
      react("❌", event);
      reply(global.formatFont("Failed to delete the command."), event);
    }
  }
};

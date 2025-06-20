const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "addcmd",
    description: "Add or replace a custom command with auto reload.",
    usage: "addcmd [name] | [code] | replace (optional)",
    cooldown: 3,
    role: 1,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const content = args.join(" ").split("|").map(p => p.trim());
    const name = content[0];
    const code = content[1];
    const replace = content[2]?.toLowerCase() === "replace";

    const commandDir = path.join(__dirname, '..', '..', 'src', 'cmds');
    const filePath = path.join(commandDir, `${name}.js`);

    if (!name || !code) {
      react("⚠️", event);
      return reply(global.formatFont("Usage: addcmd [name] | [code] | replace (optional)"), event);
    }

    try {
      if (fs.existsSync(filePath) && !replace) {
        react("❌", event);
        return reply(global.formatFont(`Command "${name}" already exists. Use 'replace' to overwrite.`), event);
      }

      fs.writeFileSync(filePath, code, "utf8");

      try {
        delete require.cache[require.resolve(filePath)];
        const newCommand = require(filePath);
        global.commands.set(newCommand.config.name, newCommand);
      } catch (reloadErr) {}

      react("✅", event);
      reply(global.formatFont(`${replace ? "Replaced" : "Added"} and reloaded: "${name}.js"`), event);
    } catch (err) {
      console.error("Error writing command:", err);
      react("❌", event);
      reply(global.formatFont("Failed to write the command."), event);
    }
  }
};

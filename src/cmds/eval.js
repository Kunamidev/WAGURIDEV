module.exports = {
  config: {
    name: "eval",
    description: "Evaluate JavaScript code silently",
    usage: "eval <code>",
    cooldown: 3,
    prefix: false,
    role: 1 // Admin only
  },

  run: async (api, event, args, reply, react) => {
    const code = args.join(" ");

    if (!code) {
      react("⚠️", event);
      return reply(global.formatFont("❗ Please provide code to evaluate."), event);
    }

    try {
      react("✅", event);
      await eval(code); // execute silently
    } catch (err) {
      react("❌", event);
      reply(global.formatFont(`⚠️ Eval Error:\n${err.message}`), event);
    }
  }
};

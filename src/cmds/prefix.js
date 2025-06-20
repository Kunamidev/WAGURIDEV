module.exports = {
  config: {
    name: "prefix",
    description: "Shows the current bot prefix and shares contact.",
    usage: "prefix",
    cooldown: 5,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply) => {
    try {
      const prefix = global.heru.prefix;
      const message = global.formatFont(`⚙️ My prefix is: 》 ${prefix} 《`);

      reply(message, event);

      return api.shareContact(
        "", // No contact caption
        event.senderID,
        event.threadID,
        (err) => {
          if (err) console.log(err);
        }
      );

    } catch (err) {
      console.log(err);
    }
  }
};

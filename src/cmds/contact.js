module.exports = {
  config: {
    name: "contact",
    description: "Share a user's contact information.",
    usage: "contact [mention/reply/userID]",
    cooldown: 3,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const { messageReply, senderID, threadID, mentions } = event;

    try {
      let userID;

      if (Object.keys(mentions).length > 0) {
        userID = Object.keys(mentions)[0];
      } else if (args.length > 0) {
        userID = args[0];
      } else if (messageReply) {
        userID = messageReply.senderID;
      } else {
        userID = senderID;
      }

      await api.shareContact('', userID, threadID);
    } catch (error) {
      console.error("❌ Error in contact command:", error);
      const errorMessage = `❌ An error occurred:\n\n${error.message || error}`;
      reply(global.formatFont(errorMessage), event);
    }
  }
};

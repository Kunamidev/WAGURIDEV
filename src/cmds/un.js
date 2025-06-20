module.exports = {
  config: {
    name: "un",
    description: "Unsend bot message",
    usage: "un <bot message>",
    cooldown: 5,
    prefix: false,
    role: 0,
  },
  run: async (api, event, args, reply, react) => {

    if (!event.messageReply || !event.messageReply.senderID) {
      return reply("Please reply to a bot message.");
    }

    if (event.messageReply.senderID !== api.getCurrentUserID()) {
      return reply("I can't unsend messages from others.");
    }

    if (event.type !== "message_reply") {
      return reply("Please reply to a bot message.");
    }

    if (!event.threadID) {
      return reply("No thread ID found. Unable to unsend message.");
    }

api.unsendMessage(event.messageReply.messageID, (err) => {
      if (err) {
        return reply("Something went wrong while trying to unsend the message.");
      }
      return reply("Message unsent successfully.");
    });
  },
};

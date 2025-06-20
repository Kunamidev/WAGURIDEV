module.exports = {
  config: {
    name: "subscribe",
  },

  run: async (api, event, args, reply, react) => {
    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();

    const mentions = [];
    const names = [];

    for (const user of logMessageData.addedParticipants) {
      names.push(user.fullName);
      mentions.push({
        tag: user.fullName,
        id: user.userFbId,
      });
    }

    const nameText = mentions.map(m => m.tag).join(', ');
    const isBotAdded = logMessageData.addedParticipants.some(u => u.userFbId === botID);

    const messageText = isBotAdded
      ? global.formatFont(`✅ ${global.heru.botName} is now active! Type "${global.heru.prefix}help" to view commands.`)
      : global.formatFont(`👋 Welcome ${nameText} to the group!`);

    api.sendMessage({ body: messageText, mentions }, threadID);
  }
};

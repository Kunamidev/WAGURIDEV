module.exports = {
  config: {
    name: "unsubscribe",
  },

  run: async (api, event) => {
    const { threadID, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    const leftID = logMessageData.leftParticipantFbId;

    if (leftID === botID) {
      return api.sendMessage(
        global.formatFont(`😢 ${global.heru.botName} has been removed from the group. I hope we meet again.`),
        threadID
      );
    }

    const kickerID = author;
    const isKick = kickerID !== leftID;

    try {
      const userInfo = await api.getUserInfo([leftID, kickerID]);
      const leftName = userInfo[leftID]?.name || "Someone";
      const kickerName = userInfo[kickerID]?.name || "Someone";

      if (isKick) {
        const messages = [
          `👢 ${leftName} was kicked out by ${kickerName}.`,
          `💥 ${kickerName} removed ${leftName} from the group.`,
          `⛔ ${leftName} is no longer here, thanks to ${kickerName}.`,
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        api.sendMessage(global.formatFont(randomMsg), threadID);
      } else {
        const messages = [
          `👋 ${leftName} left the group on their own.`,
          `😔 ${leftName} has exited the group.`,
          `📤 ${leftName} decided to leave us behind.`,
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        api.sendMessage(global.formatFont(randomMsg), threadID);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      api.sendMessage(
        global.formatFont(`👋 A member left or was removed, but I couldn't get their name.`),
        threadID
      );
    }
  }
};

module.exports = {
  config: {
    name: "subscribe",
  },

  run: async (api, event) => {
    const { logMessageType, logMessageData, threadID } = event;
    if (logMessageType !== "log:subscribe") return;

    const getUserInfo = api.getUserInfo.bind(api);
    const getUserID = api.getCurrentUserID.bind(api);

    try {
      const botID = await getUserID();
      const addedParticipants = logMessageData.addedParticipants;
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.name;
      const memberCount = threadInfo.participantIDs.length;

      for (const user of addedParticipants) {
        const userID = user.userFbId;
        if (userID === botID) continue;

        const userName = user.fullName || "New Member";
        const welcomeMsg = `🎉 Welcome ${userName} to ${groupName}!\nNow we are ${memberCount} members in total.`;

        await api.shareContact(welcomeMsg, userID, threadID);
      }
    } catch (error) {
      console.error("Subscribe event error:", error);
      api.sendMessage("❌ An error occurred while processing the welcome message.", threadID);
    }
  }
};

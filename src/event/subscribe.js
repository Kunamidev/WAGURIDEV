const axios = require("axios");

function getAvatarUser(uid) {
  return `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
}

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

        const userName = user.fullName;
        const avatarURL = getAvatarUser(userID);
        const welcomeURL = `https://heru-api.onrender.com/api/welcomeV2?nickname=${encodeURIComponent(userName)}&secondText=Have%20a%20nice%20day&avatar=${encodeURIComponent(avatarURL)}`;
        const res = await axios.get(welcomeURL, { responseType: "stream" });

        await api.sendMessage({
          body: `🎉 Welcome ${userName} to ${groupName}!\nYou're member #${memberCount}.`,
          attachment: res.data
        }, threadID);
      }
    } catch (error) {
      console.error("Subscribe event error:", error);
      api.sendMessage("❌ An error occurred while sending the welcome image.", threadID);
    }
  }
};

const axios = require("axios");

function getAvatarUser(uid) {
  return `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
}

module.exports = {
  config: {
    name: "unsubscribe",
  },

  run: async (api, event) => {
    const { threadID, logMessageData, author } = event;

    const getUserID = api.getCurrentUserID.bind(api);
    const getUserInfo = api.getUserInfo.bind(api);

    const botID = await getUserID();
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
      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      const userInfo = await getUserInfo([leftID, kickerID]);
      const leftName =
        userInfo[leftID]?.name ||
        logMessageData.leftParticipantName ||
        "Unknown";

      const kickerName =
        isKick && (userInfo[kickerID]?.name || "an admin");

      const avatarURL = getAvatarUser(leftID);
      const goodbyeURL = `https://heru-api.onrender.com/api/goodbye?pp=${encodeURIComponent(avatarURL)}&nama=${encodeURIComponent(leftName)}&bg=https://i.ibb.co/4YBNyvP/images-76.jpg&member=${memberCount}`;
      const response = await axios.get(goodbyeURL, { responseType: "stream" });

      let farewellMsg;

      if (isKick) {
        const kickMsgs = [
          `👢 ${leftName} was kicked out by ${kickerName}.`,
          `💥 ${kickerName} removed ${leftName} from the group.`,
          `⛔ ${leftName} is no longer here, thanks to ${kickerName}.`,
        ];
        farewellMsg = kickMsgs[Math.floor(Math.random() * kickMsgs.length)];
      } else {
        const leftMsgs = [
          `👋 ${leftName} left the group on their own.`,
          `😔 ${leftName} has exited the group.`,
          `📤 ${leftName} decided to leave us behind.`,
        ];
        farewellMsg = leftMsgs[Math.floor(Math.random() * leftMsgs.length)];
      }

      api.sendMessage({
        body: global.formatFont(farewellMsg),
        attachment: response.data
      }, threadID);

    } catch (error) {
      console.error("Failed to fetch user info or image:", error);
      api.sendMessage(
        global.formatFont(`👋 A member left or was removed, but I couldn't get their name.`),
        threadID
      );
    }
  }
};

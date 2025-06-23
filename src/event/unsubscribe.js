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
        isKick && (userInfo[kickerID]?.name || "An admin");

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

      return api.shareContact(
        `${farewellMsg}\nNow the group has "${memberCount}"" members left.`,
        leftID,
        threadID
      );
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      return api.shareContact(
        "👋 A member left or was removed, but I couldn't get their name.",
        logMessageData.leftParticipantFbId,
        threadID
      );
    }
  }
};

module.exports = {
  config: {
    name: "uid",
    description: "Get user or group ID",
    usage: "uid [id | reply | group | all]",
    cooldown: 3,
    role: 0,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    let id;

    if (!args[0]) {
      id = event.senderID;
    }

    if (args[0]) {
      if (args[0].startsWith("https://")) {
        try {
          const uid = await api.getUID(args[0]);
          return api.shareContact(uid, uid, event.threadID);
        } catch (err) {
          react("⚠️", event);
          return reply(global.formatFont("Failed to resolve the UID from URL."), event);
        }
      }
    }

    if (event.type === "message_reply") {
      id = event.messageReply.senderID;
    }

    const t = args.join(" ");
    if (t.includes("@")) {
      id = Object.keys(event.mentions)[0];
    }

    let m = "";
    let c = 0;

    if (t === "all") {
      for (let i of event.participantIDs) {
        c += 1;
        m += `${c}. ${i}\n`;
      }
      return reply(global.formatFont(m), event);
    }

    if (t === "-g" || t === "group") {
      id = event.threadID;
      return reply(global.formatFont(id), event);
    }

    return api.shareContact(id, id, event.threadID);
  }
};

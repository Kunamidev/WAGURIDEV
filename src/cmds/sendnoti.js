module.exports = {
  config: {
    name: "noti",
    description: "Send a notification to all groups.",
    usage: "noti [message]",
    cooldown: 0,
    prefix: false,
    role: 1
  },

  run: async (api, event, args, reply, react) => {
    const message = args.join(" ").trim();

    if (!message) {
      react("❓", event);
      return reply(global.formatFont("⚠️ | Please provide a message to send."), event);
    }

    try {
      react("📢", event);
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      let groupCount = 0;

      for (const thread of threadList) {
        if (thread.isGroup) {
          groupCount++;
          const threadName = thread.name || "Unnamed Group";
          const groupMessage = global.formatFont(`📢 Notification\n━━━━━━━━━━━━━━━━\nGroup: ${threadName}\n\n${message}\n━━━━━━━━━━━━━━━━`);
          await api.sendMessage(groupMessage, thread.threadID).catch(e => console.error(`❌ Failed to send to ${thread.threadID}:`, e.message));
        }
      }

      reply(global.formatFont(`✅ Notification sent to ${groupCount} group(s).`), event);
    } catch (err) {
      console.error("❌ Notification Error:", err.message);
      react("❌", event);
      reply(global.formatFont(`❌ Error:\n${err.message}`), event);
    }
  }
};

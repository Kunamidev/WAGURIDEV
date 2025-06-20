const { formatFont } = global;

module.exports = {
  config: {
    name: "out",
    description: "Removes the bot from the current group.",
    usage: "out",
    cooldown: 0,
    role: 1,
    prefix: false
  },

  run: async (api, event) => {
    try {
      await api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
    } catch (error) {
      console.error(formatFont(`❗ Error removing bot from group: ${error.message}`));
    }
  }
};

const cron = require("node-cron");

module.exports = {
  config: {
    name: "autogreet",
    description: "Auto greet your thread every hour with time-based messages.",
    usage: "autogreet [on/off]",
    cooldown: 3,
    role: 1,
    prefix: false
  },

  run: async (api, event, args, reply, react) => {
    const option = args[0]?.toLowerCase();
    const jobKey = `greet_${event.threadID}`;
    global.cronJobs = global.cronJobs || {};

    if (option === "on") {
      if (global.cronJobs[jobKey]) {
        react("⚠️", event);
        return reply(global.formatFont("Auto greet is already running in this thread."), event);
      }

      const job = cron.schedule("0 * * * *", () => {
        const hour = new Date().getHours();
        let greetings = [];

        if (hour >= 5 && hour < 12) {
          greetings = [
            "☀️ Magandang umaga mga lods!",
            "🌄 Morning! Huwag kalimutan mag-breakfast!",
            "💡 Rise and shine, gising na mga besh!"
          ];
        } else if (hour >= 12 && hour < 18) {
          greetings = [
            "🌤️ Good afternoon sa inyong lahat!",
            "🍽️ Kumain na kayo ng lunch?",
            "🌞 Mainit pero kaya yan, laban lang!"
          ];
        } else {
          greetings = [
            "🌙 Good evening mga lods, tulog na!",
            "😴 Huwag masyado magpuyat ha~",
            "🛌 Matulog na ng maaga, mahal ka ng admin ko(JayMar)~"
          ];
        }

        const greet = greetings[Math.floor(Math.random() * greetings.length)];
        api.sendMessage(global.formatFont(greet), event.threadID);
      });

      global.cronJobs[jobKey] = job;
      react("✅", event);
      reply(global.formatFont("Auto greet is now enabled (every hour)."), event);

    } else if (option === "off") {
      if (!global.cronJobs[jobKey]) {
        react("⚠️", event);
        return reply(global.formatFont("Auto greet is not active in this thread."), event);
      }

      global.cronJobs[jobKey].stop();
      delete global.cronJobs[jobKey];
      react("✅", event);
      reply(global.formatFont("Auto greet has been disabled."), event);

    } else {
      react("⚠️", event);
      reply(global.formatFont("Usage: autogreet [on/off]"), event);
    }
  }
};

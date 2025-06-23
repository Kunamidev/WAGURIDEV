const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const wiegine = require('ws3-fca');
const kleur = require('kleur');
require('./utils/index');
const config = require('./config.json');
const logger = require('./utils/logger');
const { formatFont, font, userFontSettings } = require('./handle/font');
const { isOnCooldown } = require('./handle/cooldown');
const pathFile = `${__dirname}/cache/restart.txt`;

function colorize(text) {
  const styles = [
    kleur.red,
    kleur.green,
    kleur.yellow,
    kleur.blue,
    kleur.magenta,
    kleur.cyan,
    kleur.white
  ];
  return text.split('').map(char => styles[Math.floor(Math.random() * styles.length)](char)).join('');
}

console.log(colorize(`
█░█░█ ▄▀█ █▀▀ █░█ █▀█ █
▀▄▀▄▀ █▀█ █▄█ █▄█ █▀▄ █
FACEBOOK BOT | Made by Jay Mar
─────────────────────────────────────
`));

global.formatFont = formatFont;

let appstate;
try {
  appstate = require('./appstate.json');
} catch (err) {
  console.log(formatFont("No appstate detected. Please sign in to generate a new session."));
  return;
}

global.heru = {
  ENDPOINT: "https://deku-rest-api.gleeze.com",
  admin: new Set(config.ADMINBOT),
  prefix: config.PREFIX,
  botName: config.BOTNAME
};

const commands = {};
const commandPath = path.join(__dirname, 'src', 'cmds');
let commandCount = 0;

try {
  const files = fs.readdirSync(commandPath);
  files.forEach(file => {
    if (file.endsWith('.js')) {
      try {
        const script = require(path.join(commandPath, file));
        commands[script.config.name] = script;
        logger.logger(formatFont(`Loaded command: ${script.config.name}`));
        commandCount++;
      } catch (e) {
        logger.warn(formatFont(`Failed to load command: ${file}\nReason: ${e.message}`));
      }
    }
  });
  console.log(formatFont(`Successfully loaded ${commandCount} commands.`));
} catch (err) {
  logger.warn(formatFont(`Error reading command directory: ${err.message}`));
}

let eventCommands = {};
const eventPath = path.join(__dirname, 'src', 'event');

function loadEventCommands() {
  eventCommands = {};
  try {
    const eventFiles = fs.readdirSync(eventPath);
    eventFiles.forEach(file => {
      if (file.endsWith('.js')) {
        try {
          delete require.cache[require.resolve(path.join(eventPath, file))];
          const script = require(path.join(eventPath, file));
          eventCommands[script.config.name] = script;
          logger.logger(formatFont(`Loaded event: ${script.config.name}`));
        } catch (e) {
          logger.warn(formatFont(`Failed to load event: ${file}\nReason: ${e.message}`));
        }
      }
    });
  } catch (err) {
    logger.warn(formatFont(`Error reading event directory: ${err.message}`));
  }
}

loadEventCommands();

chokidar.watch(eventPath).on('change', (filePath) => {
  logger.logger(formatFont(`Reloading event: ${path.basename(filePath)}`));
  loadEventCommands();
});

wiegine.login(appstate, {}, (err, api) => {
  if (err) {
    console.error(formatFont('Error logging in:'), err);
    return;
  }
  startBot(api);
  setTimeout(() => {
    console.log(formatFont('⏳ Auto restarting after 40 minutes...'));
    process.exit(1);
  }, 2400000);
});

function startBot(api) {
  console.log(formatFont('Successfully logged in!'));

  if (fs.existsSync(pathFile)) {
    const threadID = fs.readFileSync(pathFile, "utf8").trim();
    api.sendMessage("✅ Bot done restarting", threadID);
    fs.rmSync(pathFile);
  }

  api.setProfileGuard(true, (err) => {
    if (!err) {
      console.log(formatFont('✅ Profile guard enabled successfully.'));
    }
  });

  const autoPostCmd = commands["autopost"];
  if (autoPostCmd?.startAutoPost) {
    autoPostCmd.startAutoPost(api);
  }

  api.listenMqtt(async (err, event) => {
    if (err) {
      console.error(formatFont('Error in MQTT listener:'), err);
      return;
    }

    const reply = (text, event) => {
      api.sendMessage(formatFont(text), event.threadID, event.messageID);
    };

    const react = (emoji, event) => {
      api.setMessageReaction(emoji, event.messageID, () => {}, true);
    };

    if (event.type === "message" || event.type === "message_reply") {
      const message = event.body;
      const uid = event.senderID;
      const commandNameRaw = message.split(' ')[0];
      const args = message.split(' ').slice(1);
      const isPrefixed = commandNameRaw.startsWith(global.heru.prefix);
      let commandName = commandNameRaw;

      if (isPrefixed) commandName = commandNameRaw.slice(global.heru.prefix.length).toLowerCase();

      const command = commands[commandName.toLowerCase()];

      if (commandName === 'font') {
        if (args[0] === 'list') return reply(`Available fonts: ${Object.keys(font).join(', ')}`, event);
        if (args[0] === 'change' && args[1] && font[args[1]]) {
          userFontSettings.currentFont = args[1];
          return reply(`Font changed to: ${args[1]}`, event);
        }
        if (args[0] === 'enable') {
          userFontSettings.enabled = true;
          return reply('Font styling enabled.', event);
        }
        if (args[0] === 'disable') {
          userFontSettings.enabled = false;
          return reply('Font styling disabled.', event);
        }
        return reply('Invalid font command. Usage: font list, font change <fontName>, font enable, or font disable.', event);
      }

      if (command) {
        if (command.config.prefix !== false && !isPrefixed) {
          react('⚠️', event);
          return reply(`The command "${commandName}" needs a prefix.`, event);
        }

        if (command.config.prefix === false && isPrefixed) {
          react('⚠️', event);
          return reply(`The command "${commandName}" doesn't need a prefix.`, event);
        }

        if (command.config.role === 1 && !global.heru.admin.has(uid)) {
          react('⚠️', event);
          return reply(`You are not authorized to use the command "${commandName}".`, event);
        }

        const cooldownTime = isOnCooldown(commandName, uid, command.config.cooldown * 1000 || 3000);
        if (cooldownTime) return reply(`⏳ Command still on cooldown for ${cooldownTime.toFixed(1)} second(s).`, event);

        try {
          await command.run(api, event, args, reply, react);
        } catch (error) {
          react('⚠️', event);
          reply(`Error executing command '${commandName}': ${error.message}`, event);
        }
      } else if (isPrefixed) {
        api.sendMessage(formatFont(`The command "${commandName}" does not exist. Please type ${global.heru.prefix}help to see the list of commands.`), event.threadID, event.messageID);
      }
    } else if (event.type === 'event' && event.logMessageType === "log:subscribe") {
      try {
        const botID = api.getCurrentUserID();
        const addedBy = event.logMessageData.addedParticipants.find(p => p.userFbId === botID);

        if (addedBy) {
          api.sendMessage("🔄 𝗕𝗢𝗧 𝗜𝗦 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗡𝗚...", event.threadID, async (err, info) => {
            setTimeout(() => {
              api.unsendMessage(info.messageID);
            }, 5000);

            try {
              const newNickname = `[${global.heru.prefix}] - » ${global.heru.botName} «`;
              await api.changeNickname(newNickname, event.threadID, botID);
            } catch {}

            const adminLinks = Array.from(global.heru.admin).map(id => `https://facebook.com/${id}`).join(", ");
            const connectedMessage = `✅ 𝗕𝗢𝗧 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗\n━━━━━━━━━━━━━━━━\n👋 𝖧𝖾𝗅𝗅𝗈 𝖾𝗏𝖾𝗋𝗒𝗈𝗇𝖾! 𝖨'𝗆 ${global.heru.botName}. 𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗂𝗇𝗏𝗂𝗍𝗂𝗇𝗀 𝗆𝖾 𝗍𝗈 𝗍𝗁𝗂𝗌 𝗀𝗋𝗈𝗎𝗉\n\n➥ 𝗣𝗿𝗲𝗳𝗶𝘅: » ${global.heru.prefix} «\n➥ 𝗔𝗱𝗺𝗶𝗻(𝘀): ${adminLinks}\n━━━━━━━━━━━━━━━━`;

            api.sendMessage(connectedMessage, event.threadID, async () => {
              const videos = [
                "https://www.tikwm.com/video/media/play/7427318758550588678.mp4",
                "https://www.tikwm.com/video/media/play/7469214766850952469.mp4",
                "https://www.tikwm.com/video/media/play/7515822751597317398.mp4",
                "https://www.tikwm.com/video/media/play/7512191190591147286.mp4",
                "https://www.tikwm.com/video/media/play/7427128525464816904.mp4",
                "https://www.tikwm.com/video/media/play/7512714239711268101.mp4",
                "https://www.tikwm.com/video/media/play/7447108758615936262.mp4",
                "https://www.tikwm.com/video/media/play/7515020673165593912.mp4",
                "https://www.tikwm.com/video/media/play/7507022555702758678.mp4",
                "https://www.tikwm.com/video/media/play/7493542834650303799.mp4"
              ];
              const randomVideo = videos[Math.floor(Math.random() * videos.length)];
              const { data: videoStream } = await axios.get(randomVideo, { responseType: "stream" });
              await api.sendMessage({ attachment: videoStream }, event.threadID);
            });
          });
        }
      } catch (err) {
        console.log("❌ Error in group join logic:", err.message);
      }
    }
  });
}

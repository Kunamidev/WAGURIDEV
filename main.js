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

if (fs.existsSync(pathFile)) {
  const threadID = fs.readFileSync(pathFile, "utf8").trim();
  api.sendMessage("✅ Bot done restarting", threadID);
  fs.rmSync(pathFile);
}

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
});

function startBot(api) {
  console.log(formatFont('Successfully logged in!'));

  api.setProfileGuard(true, (err) => {
    if (err) {
      console.error(formatFont('Failed to enable profile guard:'), err);
    } else {
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
    } else if (event.type === 'event' && event.logMessageType) {
      const handlerName = event.logMessageType.replace('log:', '');
      const eventCommand = eventCommands[handlerName];

      if (event.logMessageType === "log:subscribe") {
        try {
          const botID = api.getCurrentUserID();
          const addedBy = event.logMessageData.addedParticipants.find(p => p.userFbId === botID);

          if (addedBy) {
            api.sendMessage("🔄 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗻𝗴 𝘁𝗼 𝗴𝗿𝗼𝘂𝗽.....", event.threadID, async () => {
              try {
                const newNickname = `[${global.heru.prefix}] - » ${global.heru.botName} «`;
                await api.changeNickname(newNickname, event.threadID, botID);
              } catch (err) {}

              const adminList = Array.from(global.heru.admin).join(", ");
              api.sendMessage(
                `✅ 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗\n━━━━━━━━━━━━━━━━\n👋 𝗛𝗲𝗹𝗹𝗼 𝗲𝘃𝗲𝗿𝘆𝗼𝗻𝗲! 𝗜'𝗺 ${global.heru.botName}, 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗶𝗻𝘃𝗶𝘁𝗶𝗻𝗴 𝗺𝗲 𝗼𝗻 𝘁𝗵𝗶𝘀 𝗴𝗿𝗼𝘂𝗽.\n\n• 𝗣𝗿𝗲𝗳𝗶𝘅: ${global.heru.prefix}\n• 𝗔𝗱𝗺𝗶𝗻(𝘀): https://facebook.com/${adminList}\n━━━━━━━━━━━━━━━━`,
                event.threadID
              );
            });
          }
        } catch (err) {}
      }

      if (eventCommand) {
        await eventCommand.run(api, event, [], reply, react);
      }
    }
  });
}

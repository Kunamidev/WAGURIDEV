const os = require("os");
const { performance } = require("perf_hooks");
const http = require("http");

module.exports = {
  config: {
    name: "upt",
    description: "Show bot uptime and system info",
    usage: "upt",
    cooldown: 5,
    prefix: false,
    role: 0
  },

  run: async (api, event, args, reply, react) => {
    react("📈", event);

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const cpuUsage = getCpuUsage();
    const ramUsage = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2);
    const cores = os.cpus().length;
    const ping = await getPing();
    const osPlatform = os.platform();
    const cpuArchitecture = os.arch();

    const result = global.formatFont(
`🤖 𝗨𝗽𝘁𝗶𝗺𝗲 & 𝗦𝘆𝘀𝘁𝗲𝗺 𝗥𝗲𝗽𝗼𝗿𝘁
━━━━━━━━━━━━━━━━━━
⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${hours}h ${minutes}m ${seconds}s
🧠 𝗖𝗣𝗨 𝗨𝘀𝗮𝗴𝗲: ${cpuUsage}%
💾 𝗥𝗔𝗠 𝗨𝘀𝗮𝗴𝗲: ${ramUsage} MB
🧩 𝗖𝗼𝗿𝗲𝘀: ${cores}
📶 𝗣𝗶𝗻𝗴: ${ping}ms
💻 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${osPlatform}
🛠 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲: ${cpuArchitecture}
━━━━━━━━━━━━━━━━━━`);

    reply(result, event);
  }
};

function getCpuUsage() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;

  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }

  const total = user + nice + sys + idle + irq;
  return ((total - idle) / total * 100).toFixed(2);
}

function getPing() {
  return new Promise((resolve) => {
    const start = performance.now();
    const req = http.request({
      hostname: "0.0.0.0",
      port: 3000,
      path: "/",
      method: "HEAD",
      timeout: 3000
    }, () => {
      const end = performance.now();
      resolve(Math.round(end - start));
    });

    req.on("error", () => {
      const end = performance.now();
      resolve(Math.round(end - start));
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(5000);
    });

    req.end();
  });
}

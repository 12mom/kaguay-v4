// استيراد الحزم والملفات الضرورية
import fs from "fs";
import login from "./logins/fcax/fb-chat-api/index.js";
import { listen } from "./listen/listen.js";
import { commandMiddleware, eventMiddleware } from "./middleware/index.js";
import sleep from "time-sleep";
import { log, notifer } from "./logger/index.js";
import gradient from "gradient-string";
import config from "./KaguyaSetUp/config.js";
import EventEmitter from "events";
import axios from "axios";
import semver from "semver";

class snfor extends EventEmitter {
  constructor() {
    super();
    this.on("system:error", (err) => {
      log([{ message: "[ ERROR ]: ", color: "red" }, { message: `Error! An error occurred: ${err}`, color: "white" }]);
      process.exit(1);
    });
    this.currentConfig = config;
    this.credentials = fs.readFileSync("./KaguyaSetUp/KaguyaState.json");
    this.package = JSON.parse(fs.readFileSync("./package.json"));
    this.checkCredentials();
  }

  checkCredentials() {
    try {
      const credentialsArray = JSON.parse(this.credentials);
      if (!Array.isArray(credentialsArray) || credentialsArray.length === 0) {
        this.emit("system:error", "Fill in appstate in KaguyaSetUp/KaguyaState.json!");
        process.exit(0);
      }
    } catch (error) {
      this.emit("system:error", "Cannot parse JSON credentials in KaguyaSetUp/KaguyaState.json");
    }
  }

  async checkVersion() {
    try {
      // تدرج وردي جميل
      const pinkGradient = gradient(["#ff66cc", "#ff00ff", "#cc00ff"]);
      
      console.log("");
      console.log(pinkGradient(`       
█▀█ █▀█ █▄░█ █▀▀ █▀█ █▀
█▀▄ █▄█ █░▀█ █▄▄ █▄█ ▄█
      `));

      console.log(pinkGradient("=".repeat(55)));
      console.log(`${pinkGradient("[ المطور ]: ")} ${gradient("cyan", "pink")("حمودي سان 🇸🇩")}`);
      console.log(`${pinkGradient("[ فيسبوك ]: ")} ${gradient("cyan", "pink")("https://www.facebook.com/babasnfor80")}`);
      console.log(`${pinkGradient("[ رسالة ]: ")} ${gradient("white", "pink")("أحبكم يا سنافري ❤️")}`);
      console.log(pinkGradient("=".repeat(55)));
      console.log("");

      // التحقق من التحديثات (اختياري - يمكن تعطيله لعدم الاتصال بجهاز غريب)
      try {
        const { data } = await axios.get("https://raw.githubusercontent.com/Tshukie/Kaguya-Pr0ject/master/package.json");
        if (semver.lt(this.package.version, data.version)) {
          log([
            { message: "[ نظام ]: ", color: "yellow" },
            { message: "يوجد تحديث جديد! تواصل مع المطور.", color: "white" }
          ]);
        }
      } catch (err) {
        log([
          { message: "[ تنبيه ]: ", color: "yellow" },
          { message: "تعذر التحقق من التحديثات.", color: "white" }
        ]);
      }

      this.emit("system:run");

    } catch (err) {
      this.emit("system:error", err);
    }
  }

  async loadComponents() {
    let failedCount = 0;

    // تحميل الأوامر
    try {
      await commandMiddleware();
      console.log(`✔ تم تحميل ${global.client.commands.size} أمر.`);
    } catch (err) {
      failedCount++;
      console.error(`❌ فشل تحميل الأوامر: ${err.message}`);
    }

    // تحميل الأحداث
    try {
      await eventMiddleware();
      console.log(`✔ تم تحميل ${global.client.events.size} حدث.`);
    } catch (err) {
      failedCount++;
      console.error(`❌ فشل تحميل الأحداث: ${err.message}`);
    }

    // عرض النتائج
    console.log("=".repeat(50));
    console.log(`✔ إجمالي الأوامر: ${global.client.commands.size}`);
    console.log(`✔ إجمالي الأحداث: ${global.client.events.size}`);
    if (failedCount > 0) {
      console.log(`❌ فشل في تحميل ${failedCount} مكون.`);
    } else {
      console.log("✔ جميع المكونات تم تحميلها بنجاح!");
    }
    console.log("=".repeat(50));
  }

  start() {
    setInterval(() => {
      const t = process.uptime();
      const [i, a, m] = [Math.floor(t / 3600), Math.floor((t % 3600) / 60), Math.floor(t % 60)].map((num) => (num < 10 ? "0" + num : num));
      const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
      const memoryData = process.memoryUsage();
      process.title = `snfor - المطور: حمودي سان - ${i}:${a}:${m} - ذاكرة: ${formatMemoryUsage(memoryData.external)}`;
    }, 1000);

    (async () => {
      global.client = {
        commands: new Map(),
        events: new Map(),
        cooldowns: new Map(),
        aliases: new Map(),
        handler: {
          reply: new Map(),
          reactions: new Map(),
        },
        config: this.currentConfig,
      };

      await this.loadComponents();

      this.checkVersion();

      this.on("system:run", () => {
        login({ appState: JSON.parse(this.credentials) }, async (err, api) => {
          if (err) this.emit("system:error", err);

          api.setOptions(this.currentConfig.options);

          const listenMqtt = async () => {
            try {
              if (!listenMqtt.isListening) {
                listenMqtt.isListening = true;
                const mqtt = await api.listenMqtt(async (err, event) => {
                  if (err) this.on("error", err);
                  await listen({ api, event, client: global.client });
                });
                await sleep(this.currentConfig.mqtt_refresh);
                notifer("[ MQTT ]", "جاري تحديث الاتصال!");
                log([{ message: "[ MQTT ]: ", color: "yellow" }, { message: `جاري تحديث الاتصال!`, color: "white" }]);
                await mqtt.stopListening();
                await sleep(5000);
                notifer("[ MQTT ]", "تم التحديث بنجاح!");
                log([{ message: "[ MQTT ]: ", color: "green" }, { message: `تم التحديث بنجاح!`, color: "white" }]);
                listenMqtt.isListening = false;
              }
              listenMqtt();
            } catch (error) {
              this.emit("system:error", error);
            }
          };

          listenMqtt.isListening = false;
          listenMqtt();
        });
      });
    })();
  }
}

// تشغيل البوت
const snforInstance = new snfor();
snforInstance.start();

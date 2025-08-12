// KaguyaSetUp/config.js
export default {
    prefix: "",
    BOT_NAME: "dora",
    ADMIN_IDS: ["100001234567890"], // ← غيره إلى معرفك الحقيقي على فيسبوك
    botEnabled: true,
    autogreet: true,
    options: {
        forceLogin: true,
        listenEvents: true,
        listenTyping: true,
        logLevel: "silent",
        updatePresence: true,
        selfListen: false, // ← مُعدّل: لتجنب الحلقات
        usedDatabase: false // ← إذا كنت لا تستخدم قاعدة بيانات
    },
    database: {
        type: "json" // فقط إذا usedDatabase = true
        // mongodb: { uri: "..." } — احذفه إذا لم تستخدم MongoDB
    },
    port: 3000,
    mqtt_refresh: 1200000
};

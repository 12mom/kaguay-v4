// KaguyaSetUp/config.js
export default {
    "prefix": "*", 
    "BOT_NAME": "ⓜⓘⓚⓞ",
    "ADMIN_IDS": ["61550232547706"],
    "botEnabled": true,
    "autogreet": true,
    "options": {
        "forceLogin": true,
        "listenEvents": true,
        "listenTyping": true,
        "logLevel": "silent",
        "updatePresence": true,
        "selfListen": true,
        "usedDatabase": false
    },
    database: {
        type: "json",
        mongodb: {
            uri: "mongodb://0.0.0.0:27017"
        }
    },
    // فقط القيمة الافتراضية، بدون process.env
    port: 3000,  // سيتم تجاوزه في app.js باستخدام process.env.PORT
    mqtt_refresh: 1200000
};

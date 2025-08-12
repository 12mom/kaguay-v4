export default {
    "prefix": "", 
    "BOT_NAME": "dora",
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
    port: 3000,
    mqtt_refresh: 1200000
};

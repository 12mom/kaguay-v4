import { addXP, getRank } from "../systems/leveling.js";

client.on('message', (message) => {
  if (message.isSelf) return;

  const { levelUp, oldLevel, newLevel } = addXP(message.senderID, message.senderName);

  // إذا صعد مستوى
  if (levelUp) {
    const levelName = [
      "مبتدئ", "ناشئ", "محترف", "ملك الشات", "أسطورة",
      "إله الميمز", "حاكم السنافري", "ملك snfor", "الخالد"
    ][newLevel - 1] || "الخالد";

    message.reply(`
🎉 *مبروك!* صعدت مستوى يا ${message.senderName}!
🎯 المستوى: ${oldLevel} → ${newLevel}
🏆 الرتبة: ${levelName}
💥 أنت الآن جزء من أساطير snfor!
    `);
  }
});

if (body === "!مستواي" || body === "!me") {
  const rank = getRank(message.senderID);
  if (!rank) {
    message.reply("ما عندكش بيانات بعد، اكتب رسالة علشان تبدأ!");
  } else {
    message.reply(`
📊 *معلومتك في snfor* 📊
──────────────────────
👤 الاسم: ${rank.name}
🏆 المستوى: ${rank.level} (${rank.levelName})
🎯 XP: ${rank.xp} / ${getXPForNextLevel(rank.level)}
🎖️ الترتيب: ${rank.rank} من ${rank.totalUsers}
──────────────────────
أحبكم يا سنافري ❤️
    `);
  }
}

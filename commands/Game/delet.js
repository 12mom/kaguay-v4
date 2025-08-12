if (body === "!احذف") {
  // يحذف الرسالة السابقة اللي أرسلها البوت
  const lastMessageID = global.client.lastBotMessageID; // لازم تخزن آخر رسالة
  if (lastMessageID) {
    api.unsendMessage(lastMessageID);
    message.reply("✅ تم حذف الرسالة.");
  } else {
    message.reply("❌ ما فيش رسالة للحذف.");
  }
}

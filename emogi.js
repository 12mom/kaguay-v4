client.on('message', (message) => {
  // تجاهل الرسائل من البوت نفسه
  if (message.isSelf) return;

  // استخراج كل الإيموجيز من الرسالة
  const emojis = message.body?.match(/[\p{Emoji}]/gu);

  // لو في إيموجي، اعمل ريد (رد تفاعلي)
  if (emojis && emojis.length > 0) {
    const reaction = emojis[0]; // خذ أول إيموجي ظاهر

    // تأخير بسيط علشان يبان طبيعي (مثلاً 1-2 ثانية)
    setTimeout(() => {
      api.sendMessage(reaction, message.threadID, (err) => {
        if (err) console.error("❌ فشل إرسال التفاعل:", err);
      });
    }, 1000 + Math.random() * 1000); // بين 1 و2 ثانية
  }
});

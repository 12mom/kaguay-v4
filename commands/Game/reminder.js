if (body === "!تذكير") {
  const reminders = [
    "يا سنافري، ما تنساش إنك مميز!",
    "الحمد لله على كل شيء، أنت أقوى مما تظن!",
    "اليوم يومك، استمتع بكل لحظة!",
    "أنت أقرب إلى أحلامك مما تتخيل!"
  ];
  const random = reminders[Math.floor(Math.random() * reminders.length)];
  message.reply(`📌 *تذكير:* ${random}`);
}

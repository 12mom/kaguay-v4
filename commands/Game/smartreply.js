// 🌟 بوت snfor - الذكاء البشري المختصر
// 🛠️ المطور: حمودي سان 🇸🇩
// 💬 أحبكم يا سنافري ❤️

const userMemory = new Map(); // ذاكرة محادثات

client.on('message', (message) => {
  if (message.isSelf || !message.body) return;
  const body = message.body.toLowerCase().trim();
  const sender = message.senderName || "يا سنافري";
  const senderID = message.senderID;
  const isMentioned = body.includes("snfor") || body.includes("بوت");

  // لا يرد على الأوامر
  if (body.startsWith("!")) return;

  // تأخير واقعي (1 إلى 3 ثواني)
  const delay = 1000 + Math.random() * 2000;

  // تحليل المزاج
  const getMood = (txt) => {
    if (["تعبت", "حزين", "ممل", "ضعيف"].some(w => txt.includes(w))) return "sad";
    if (["ههه", "حلو", "ممتاز", "ضحكة"].some(w => txt.includes(w))) return "happy";
    if (txt.includes("?") || ["كيف", "ليش", "وش", "هل", "متى"].some(w => txt.includes(w))) return "question";
    return "neutral";
  };

  // الردود الذكية
  const replies = {
    sad: ["يا قلبي ❤️", "أنا معاك يا سنافري", "ما تستسلمش، أنت أقوى من كذا"],
    happy: ["ههه، ضحكتك تهزمني!", "الفرح في صوتك حلو!"],
    question: ["سؤالك مهم...", "أنا أفكر...", "طب، شتقول؟"],
    mention: ["نعم؟ أنا هنا يا سنافري", "لما تكتب اسمي، أحس بالفرحة ❤️", "شنو؟ ما تخليني أرد؟"],
    emoji: {
      "😂": "أنا عرفت إنك تضحك عليا 😏",
      "🥲": "يا قلبي، ما تحزنش، أنا معاك ❤️",
      "❤️": "قلبك تبرع لsnfor، شكراً!",
      "😴": "نام بس ما تنساني!",
      "🔥": "أنت النار يا سنافري!"
    }
  };

  // تحقق من الإيموجي أولًا
  const emoji = Object.keys(replies.emoji).find(e => body.includes(e));
  if (emoji) {
    setTimeout(() => message.reply(replies.emoji[emoji]), delay * 0.5);
    return;
  }

  // تحقق من المنشن
  if (isMentioned) {
    const reply = replies.mention[Math.floor(Math.random() * replies.mention.length)];
    setTimeout(() => message.reply(reply), delay);
    return;
  }

  // تحقق من المزاج
  const mood = getMood(body);
  if (mood !== "neutral") {
    const reply = replies[mood][Math.floor(Math.random() * replies[mood].length)];
    setTimeout(() => message.reply(reply), delay);
    return;
  }

  // ذاكرة بسيطة (رد على سياق سابق)
  const lastMsg = userMemory.get(senderID);
  if (lastMsg && lastMsg.includes("دراسة") && body.includes("تعبت")) {
    setTimeout(() => message.reply("الدراسة تعبانة، بس مستقبلك أجمل ❤️"), delay);
  }

  // رد افتراضي
  const defaultReplies = [
    "أنا سامعك، تابع...",
    "طيب، شتبي تسوي؟",
    "أحبكم يا سنافري، حتى لو ما تكتبوا",
    "حمودي سان معاكم دايمًا 🇸🇩"
  ];
  const reply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];

  setTimeout(() => message.reply(reply), delay);

  // سجل آخر رسالة
  userMemory.set(senderID, body);
});

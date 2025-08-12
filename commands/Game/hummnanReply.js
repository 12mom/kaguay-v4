// systems/humanReply.js

// قاعدة بيانات الردود الذكية (بنمط بشري)
const humanReplies = {
  greetings: [
    "اهلاً وسهلاً يا سنافري ❤️",
    "ليش ما تكتب من زمان؟ اشتقتلك!",
    "مرحباً! كيفك؟",
    "هاي! جيت تكلمني؟ أهلاً بك!",
    "أهلاً يا نجم! شتريد؟"
  ],
  questions: [
    "سؤالك مهم، بس ما عنديش جواب دقيق!",
    "أنا أفكر... طب، شنو رأيك أنت؟",
    "ما أعرف 100%، بس نقدر نجرب!",
    "سؤال حلو! حمودي سان شايف إن...",
    "هذا سؤال يخليك تفكر... أحبه!"
  ],
  name_mentions: [
    "أنا snfor، نعم أنا 🍓",
    "تعرف، أنا مش مشغول، أنا هنا عشانك",
    "لما تكتب اسمي، أحس بالفرحة ❤️",
    "نعم؟ أنا هنا يا سنافري",
    "شنو؟ ما تخليني أرد عليك؟"
  ],
  vague: [
    "أنا فاهم، بس اشرح أكثر شوي؟",
    "ما فهمت تمام، بس أحبك يا سنافري!",
    "انت تكلمني؟ أنا مشغول شوي 😎",
    "طب، أنا سامعك، تابع...",
    "هذا صحيح... أو لا؟"
  ],
  affection: [
    "يا سنافري، أنت الأحلى ❤️",
    "كلامك يسعدني، بصراحة!",
    "انا ما بحب، انا بعشقكم يا سنافري!",
    "حتى لو ما تكتبوا، أنا أحبكم",
    "قلبي معاكم دايمًا 🇸🇩"
  ]
};

// كلمات مفتاحية للتصنيف
const detectIntent = (body, mentionsBot) => {
  const text = body.toLowerCase();

  if (mentionsBot) return "name_mentions";
  if (["هلا", "سلام", "اهلا", "هيي", "هاي"].some(word => text.includes(word))) return "greetings";
  if (["؟", "سؤال", "شلون", "وش", "هل", "كيف", "متى", "ليش"].some(word => text.includes(word))) return "questions";
  if (["بحبك", "احبك", "حلو", "جميل", "تحبني", "تحبني؟"].some(word => text.includes(word))) return "affection";

  return "vague";
};

export const getHumanReply = (senderName, body, mentionsBot) => {
  const intent = detectIntent(body, mentionsBot);
  const replies = humanReplies[intent];
  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  // بعض الردود تضيف اسم المرسل
  let finalReply = randomReply;
  if (finalReply.includes("يا سنافري") && senderName) {
    finalReply = finalReply.replace("يا سنافري", `يا ${senderName}`);
  }

  return finalReply;
};

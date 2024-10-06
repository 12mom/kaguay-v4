import fs from 'fs';
import path from 'path';

export default {
  name: "الردود",
  author: "Arjhil Dacayanan",
  cooldowns: 0,
  description: "يتفاعل مع كلمات محددة في الرسائل",
  role: "member",
  aliases: [],
  
  execute: async ({ api, event }) => {
    // لا شيء مطلوب في التنفيذ الرئيسي هنا
  },
  
  events: async ({ api, event, Users, Threads, Economy }) => {
    const message = event.body ? event.body.toLowerCase() : "";
    const threadID = event.threadID;

    // قائمة الجمل والردود
    const responses = [
      { keywords: ["احبك", "أحبك"], response: "ها يمعود مو هنا" },
      { keywords: ["شكرا", "شكرا يا بوت"], response: "العفو هذا واجب" },
      { keywords: ["عضمة", "عضمه"], response: "ماكس التميت سوبر عضمة" },
      { keywords: ["صباح الخير", "صباح"], response: "صباح الخير و السرور و باقات الزهور" },
      { keywords: ["كيفكم", "شلونكم"], response: "بخير حياتي ماذا عنك!" },
      { keywords: ["اتفق", "أتفق"], response: "اطلق من يتفق" },
      { keywords: ["أصنام"], response: "نعم أرى هذا" },
      { keywords: ["إجييت"], response: "منور يا غالي 🙂" },
      { keywords: ["هلو", "هلا"], response: "هلاوات ❤️" },
      { keywords: ["بوت غبي"], response: "وأنت أغبى يا مخ العصفور" },
      { keywords: ["جميل", "راقي"], response: "حبيبي نت الارقى والأجمل❤️" },
      { keywords: ["بوسة", "اريد بوسه"], response: "استحي ع روحك بكد المطي تدور بوس" },
      { keywords: ["تزوجيني يا كاغويا", "تزوجيني يا هيناتا"], response: "️في أحلامك" },
      { keywords: ["كيف الحال", "كيف حالك"], response: ", الحمدلله ماذا عنك:))))" },
      { keywords: ["الحمدلله دومك", "بخير دوم"], response: "️آمين بدوامك انشاء الله" },
      { keywords: ["ثباحو", "ثباحوو"], response: "️ثباحوات <3/" },
      { keywords: ["تالف", "أنا تالف"], response: "️أهلا أخي هل أنت تالف؟" },
      { keywords: ["السلام عليكم", "سلام"], response: "️و؏ٌٍـلًِيٌِگِـٍٍّّـًـًٍم السـلام" },
      { keywords: ["وداعا", "أنا ذاهب"], response: "️وداعا مع السلامه آمل أن نراك قريبا ☺️" },
      { keywords: ["من أنتي يا هيناتا", "عرفينا على نفسك"], response: "️حسنا إسمي هيناتا..." },
      { keywords: ["بوت أحمق"], response: "️فقط أكمل..." },
      { keywords: ["حسين", "صائد الأرواح"], response: "️ سيدي مشغول حاليا" },
      { keywords: ["المالك", "المطور"], response: "️حسين طبعا لكن يمكنك مناداته صائد الأرواح" },
      { keywords: ["مساء الخير"], response: "️مساء النور و السرور و الورد المنثور <3 <3" },
      { keywords: ["🙂"], response: "هذا الإيموجي بالضبط لا يمكن التكهن بما يخفيه 😑" },
      { keywords: ["أنا جائع"], response: "زدني عليك أتمنى أن أتناول الشكولاتة 🥺 :>>" },
      { keywords: ["يأيها البوت", "أين هو البوت"], response: "أنا هنا يا أخي 🙂:))))" },
      { keywords: ["تصبحون على خير", "تصبح على خير"], response: "وأنت من أهله" },
      { keywords: ["تأخر الوقت"], response: "نعم و عليكم أن تذهبو للنوم <3" },
      { keywords: ["👍"], response: "جرب ضغط لايك مرة أخرى و راح تشوف 🙂🔪" },
      { keywords: ["هل ريم تحبني"], response: "بخير الحمدلله دومكم إن شاء الله" },
      { keywords: ["أشعر أنني وحيد", "ليس لدي أحد"], response: "لا تقلق... أنا معك" },
      { keywords: ["أظن أن البوت نام أيضا", "مات البوت"], response: "أنا هنا يا غبي 🙂 <3" },
      { keywords: ["كم عمرك"], response: "18 <3" }
    ];

    // تحقق من وجود تطابق
    for (const item of responses) {
      for (const keyword of item.keywords) {
        if (message.includes(keyword)) {
          api.sendMessage(item.response, threadID);
          return;
        }
      }
    }
  },

  onReply: async () => {
    // لا شيء مطلوب هنا
  },

  onReaction: async () => {
    // لا شيء مطلوب هنا
  }
};

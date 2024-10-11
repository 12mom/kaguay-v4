import { log } from "../logger/index.js";
import fs from "fs";
import path from "path";

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    // جلب بيانات المجموعة
    var threads = (await Threads.find(event.threadID))?.data?.data;

    // التحقق من وجود بيانات المجموعة
    if (!threads) {
      await Threads.create(event.threadID);
    }

    switch (event.logMessageType) {
      case "log:unsubscribe": {
        // إذا تم طرد البوت من المجموعة
        if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
          await Threads.remove(event.threadID);
          return log([
            {
              message: "[ THREADS ]: ",
              color: "yellow",
            },
            {
              message: `تم حذف بيانات المجموعة مع المعرف: ${event.threadID} لأن البوت تم طرده.`,
              color: "green",
            },
          ]);
        }
        // تحديث عدد الأعضاء بعد خروج شخص
        await Threads.update(event.threadID, {
          members: +threads.members - 1,
        });
        break;
      }

      case "log:subscribe": {
        // إذا تمت إضافة البوت إلى المجموعة
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // حذف رسالة التوصيل
          api.unsendMessage(event.messageID);

          // تغيير اسم البوت عند إضافته إلى المجموعة
          const botName = "كاغويا"; // اسم البوت
          api.changeNickname(
            `》 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID()
          );

          // تحديد مسار الـ GIF باستخدام process.cwd() و path
          const gifPath = path.join(process.cwd(), 'cache12', 'welcom.gif'); // تأكد من أن الملف موجود في المسار المحدد

          // التحقق من وجود ملف الـ GIF
          if (!fs.existsSync(gifPath)) {
            return api.sendMessage("❌ | ملف GIF غير موجود في المسار المحدد.", event.threadID);
          }

          // قراءة ملف الـ GIF
          const gifAttachment = fs.createReadStream(gifPath);

          // رسالة الترحيب عند إضافة البوت فقط
          const welcomeMessage = `✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  |  اكتب قائمة او اوامر او تقرير في حالة واجهتك أي مشكلة\n╼╾─────⊹⊱⊰⊹─────╼╾\n ⪨༒𓊈𒆜𝔨𝔞𝔤𝔲𝔶𝔞 𝔠𝔥𝔞𝔫 𒆜𓊉༒⪩ \n╼╾─────⊹⊱⊰⊹─────╼╾\n❏ رابـط الـمـطـور : \nhttps://www.facebook.com/profile.php?id=100076269693499`;

          // إرسال رسالة الترحيب مع الـ GIF
          api.sendMessage({
            body: welcomeMessage,
            attachment: gifAttachment
          }, event.threadID);

        } else {
          // إذا تم إضافة أعضاء آخرين، فقط تحديث عدد الأعضاء بدون رسائل
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          // تحديث عدد الأعضاء بعد إضافة أشخاص
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });
        }
        break;
      }
    }
  },
};

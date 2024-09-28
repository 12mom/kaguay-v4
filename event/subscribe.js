import { log } from "../logger/index.js";
import fs from "fs";
import axios from "axios";
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

          // مسار الفيديو الذي سيتم إرساله عند إضافة البوت إلى المجموعة
          const welcomeVideoPath = path.join(process.cwd(), 'cache12', 'welcome.mp4');

          // التحقق من وجود الفيديو قبل إرساله
          if (fs.existsSync(welcomeVideoPath)) {
            // إرسال الفيديو
            const attachment = fs.createReadStream(welcomeVideoPath);
            api.sendMessage({
              body: `┌───── ～✿～ ─────┐\n✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n❏ رابـط الـمـطـور : https://www.facebook.com/profile.php?id=100076269693499 \n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  | اكتب قائمة او اوامر \n╼╾─────⊹⊱⊰⊹─────╼╾\n🔖 | اكتب ضيفيني من اجل ان تدخل مجموعة البوت او تقرير \n╼╾─────⊹⊱⊰⊹─────╼╾\n〘🎀 KᗩGᑌYᗩ ᗷOT 🎀〙\n└───── ～✿～ ─────┘`,
              attachment
            }, event.threadID);
          } else {
            console.error("ملف الفيديو غير موجود في المسار المحدد:", welcomeVideoPath);
          }

        } else {
          // إذا تم إضافة أعضاء آخرين
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

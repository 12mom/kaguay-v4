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

          // رابط الـ GIF
          const gifURL = "https://i.ibb.co/r2MQtKx/welcome.gif"; // ضع رابط الـ GIF هنا

          // تحديد المسار لحفظ الـ GIF باستخدام process.cwd() و path
          const gifPath = path.join(process.cwd(), 'cache', 'welcome.gif');

          // تنزيل وحفظ الـ GIF
          const response = await axios.get(gifURL, { responseType: 'arraybuffer' });
          fs.writeFileSync(gifPath, Buffer.from(response.data, 'binary'));

          // قراءة الـ GIF كـ Buffer
          const gifBuffer = fs.readFileSync(gifPath);

          // رسالة الترحيب عند إضافة البوت فقط
          const welcomeMessage = `✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  |  اكتب قائمة او اوامر او تقرير في حالة واجهتك أي مشكلة\n╼╾─────⊹⊱⊰⊹─────╼╾\n ⪨༒𓊈𒆜𝔨𝔞𝔤𝔲𝔶𝔞 𝔠𝔥𝔞𝔫 𒆜𓊉༒⪩ \n╼╾─────⊹⊱⊰⊹─────╼╾\n❏ رابـط الـمـطـور : \nhttps://www.facebook.com/profile.php?id=100076269693499`;

          // إرسال الرسالة مع ملف الـ GIF
          api.sendMessage({
            body: welcomeMessage,
            attachment: gifBuffer
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

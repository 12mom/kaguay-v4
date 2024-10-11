import { log } from "../logger/index.js";
import moment from "moment-timezone";
import fs from "fs";

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    var threads = (await Threads.find(event.threadID))?.data?.data || {};
    if (!threads) {
      await Threads.create(event.threadID);
    }
    switch (event.logMessageType) {
      case "log:unsubscribe":
        {
          if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
            await Threads.remove(event.threadID);
            return log([
              {
                message: "[ THREADS ]: ",
                color: "yellow",
              },
              {
                message: ` ❌ | المجموعة  مع المعرف : ${event.threadID} قامت بطرد البوت خارجا `,
                color: "green",
              },
            ]);
          }
          await Threads.update(event.threadID, {
            members: +threads.members - 1,
          });
          kaguya.reply(event.logMessageBody);
          break;
        }
      case "log:subscribe": {
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // حذف رسالة حارس توصيل كاغويا
          api.unsendMessage(event.messageID);

          // تغيير كنية البوت تلقائيا عند الإضافة إلى المجموعة
          const botName = "ⓀⒶⒼⓊⓎⒶ"; // اسم البوت يدويا
          api.changeNickname(
            `》 ${global.client.config.prefix} 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID()
          );

          // تزيين رسالة الدخول
          const currentTime = moment().tz("Africa/Casablanca").format("YYYY-MM-DD HH:mm:ss");
          const welcomeMessagePart1 = `✅ | تــم الــتــوصــيــل بـنـجـاح\n❏ الـرمـز : 『بدون رمز』\n❏ إسـم الـبـوت : 『${botName}』\n❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』\n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  |  اكتب قائمة او اوامر او تقرير في حالة واجهتك أي مشكلة\n╼╾─────⊹⊱⊰⊹─────╼╾\n ⪨༒𓊈𒆜𝔨𝔞𝔤𝔲𝔶𝔞 𝔠𝔥𝔞𝔫 𒆜𓊉༒⪩ \n╼╾─────⊹⊱⊰⊹─────╼╾\n❏ رابـط الـمـطـور : \nhttps://www.facebook.com/profile.php?id=100076269693499\n╼╾─────⊹⊱⊰⊹─────╼╾`;

          const welcomeMessagePart2 = `✿━━━━━━━━━━━━━━✿\n ⚙️  | جاري توصيل ${botName} في المجموعة..... \n
❏ التاريخ : ${moment().tz("Africa/Casablanca").format("YYYY-MM-DD")}
❏ الوقت : ${moment().tz("Africa/Casablanca").format("HH:mm:ss")}
\n✿━━━━━━━━━━━━━━✿`;

          // إرسال رسالة الدخول
          const videoPath = "cache12/welcom.gif";
          api.sendMessage(
            {
              body: welcomeMessagePart1,
              attachment: fs.createReadStream(videoPath),
            },
            event.threadID
          );
          api.sendMessage(welcomeMessagePart2, event.threadID);
        } else {
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });

          // إرسال رسالة الدخول
          return kaguya.send(event.logMessageBody);
        }
      }
    }
  },
};

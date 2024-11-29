import axios from "axios";
import path from "path";
import fs from "fs-extra";
import moment from "moment-timezone";

export default {
  name: "تخيلي",
  author: "مشروع كاغويا",
  role: "member",
  aliases: ["dalle", "تخيل"],
  description: "توليد صورة بناءً على النص المدخل.",

  async execute({ api, event }) {
    const senderID = event.senderID;

    // طلب إدخال النص من المستخدم
    api.sendMessage(
      `❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜\n\t\t〖𝙸𝙼𝙰𝙶𝙸𝙽𝙰𝚃𝙸𝙾𝙽 𝚂𝙴𝙲𝚃𝙸𝙾𝙽〗\n👥 | من فضلك أدخل النص (البرومبت) الذي تريد تحويله إلى صورة:\n
      ❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜`,
      event.threadID,
      (err, message) => {
        if (err) return console.error("Error sending message:", err);

        api.setMessageReaction("🕐", event.messageID, (err) => {
          if (err) console.error("Error setting reaction:", err);
        }, true);

        // تخزين بيانات الرد للتعامل معه لاحقًا
        global.client.handler.reply.set(message.messageID, {
          author: senderID,
          type: "textPrompt",
          name: "تخيلي",
          unsend: true,
        });
      }
    );
  },

  async onReply({ api, event, reply }) {
    if (reply.author !== event.senderID) return; // التأكد من أن المرسل هو نفسه
    const messageBody = event.body.trim();

    try {
      // ترجمة النص باستخدام Google Translate API
      const translationResponse = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(
          messageBody
        )}`
      );
      const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0];
      if (!translatedPrompt) {
        api.sendMessage("⚠️ | فشل في ترجمة النص.", event.threadID, event.messageID);
        return;
      }

      // جلب الصورة باستخدام رابط API
      const apiUrl = `https://ccprojectapis.ddns.net/api/blackbox/gen?prompt=${encodeURIComponent(
        translatedPrompt
      )}`;
      const response = await axios.get(apiUrl);
      const imageUrl = response?.data?.response?.match(/(.*?)/)?.[1]; // استخراج الرابط من النص
      if (!imageUrl) {
        api.sendMessage("⚠️ | فشل في استرجاع الصورة.", event.threadID, event.messageID);
        return;
      }

      // إعداد مسار الحفظ
      const downloadDirectory = path.join(process.cwd(), "cache");
      fs.ensureDirSync(downloadDirectory);
      const filePath = path.join(downloadDirectory, `${Date.now()}.jpg`);

      // تحميل الصورة وحفظها
      const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
      const fileStream = fs.createWriteStream(filePath);

      imageResponse.data.pipe(fileStream);

      fileStream.on("finish", async () => {
        fileStream.close();
        const now = moment().tz("Africa/Casablanca");
        const timeString = now.format("HH:mm:ss");
        const dateString = now.format("YYYY-MM-DD");

        api.getUserInfo(event.senderID, async (err, userInfo) => {
          if (err) {
            console.log(err);
            api.sendMessage("⚠️ | حدث خطأ أثناء جلب معلومات المستخدم.", event.threadID, event.messageID);
            return;
          }

          const userName = userInfo[event.senderID].name;
          const messageBody = `\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`;

          // تفاعل مع الرسالة وأرسل الصورة
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
          api.sendMessage(
            {
              body: messageBody,
              attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            () => fs.unlinkSync(filePath),
            event.messageID
          );
        });
      });

      fileStream.on("error", (error) => {
        api.sendMessage("❌ | حدث خطأ أثناء تنزيل الصورة. يرجى المحاولة لاحقًا.", event.threadID, event.messageID);
        console.error("خطأ في تنزيل الصورة:", error);
      });
    } catch (error) {
      api.sendMessage("❌ | حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
      console.error("خطأ أثناء معالجة الطلب:", error);
    }
  },
};

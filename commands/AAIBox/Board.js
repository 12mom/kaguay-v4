import axios from "axios";
import fs from "fs-extra";
import path from "path";

async function boardAlert({ api, event, args }) {
  try {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("⚠️ | يرجى إدخال نص لتوليد الصورة.\nمثال: لوح الحكمة", threadID, messageID);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const imagePath = path.join(process.cwd(), 'cache', `${timestamp}_board.png`);

    // إضافة رد فعل للإشارة إلى بدء العملية
    api.setMessageReaction("⏱️", event.messageID, () => {}, true);

    // استخدام الرابط الجديد لجلب الصورة
    const response = await axios.get(`https://api-canvass.vercel.app/board?text=${encodeURIComponent(query)}`, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));

    // تغيير رد الفعل للإشارة إلى نجاح العملية
    api.setMessageReaction("🔲", event.messageID, () => {}, true);

    // إرسال الصورة بعد 5 ثواني ثم حذفها
    setTimeout(function () {
      api.sendMessage({
        body: "",
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => {
        setTimeout(() => {
          fs.unlinkSync(imagePath);
        }, 5 * 1000);
      }, messageID);
    }, 5 * 1000);
  } catch (error) {
    console.error(error);
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
}

export default {
  name: "لوح",
  author: "kaguya project",
  description: "يرسل صورة لوح مع النص المقدم.\nمثال: لوح الحكمة",
  aliases: ["لوحة"],
  execute: boardAlert
};

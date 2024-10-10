import axios from "axios";
import fs from "fs-extra";
import path from "path";

async function avatarAlert({ api, event, args }) {
  try {
    const { threadID, messageID } = event;

    // التحقق من أن المستخدم أدخل 4 قيم
    if (args.length !== 4) {
      return api.sendMessage("⚠️ | يرجى إدخال 4 معلومات بالترتيب: id, bgname, signature, color.\nمثال: 1 Joshua 'Joshua Sy' blue", threadID, messageID);
    }

    // استخلاص القيم من المدخلات
    const [id, bgname, signature, color] = args;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const imagePath = path.join(process.cwd(), 'cache', `${timestamp}_avatar.png`);

    // إضافة رد فعل لإعلام المستخدم بأن العملية قيد التقدم
    api.setMessageReaction("📱", event.messageID, () => {}, true);

    // جلب الصورة باستخدام القيم المدخلة
    const response = await axios.get(`https://deku-rest-api.gleeze.com/canvas/avatarv2?id=${encodeURIComponent(id)}&bgtext=${encodeURIComponent(bgname)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));

    // تغيير رد الفعل لإعلام المستخدم بنجاح العملية
    api.setMessageReaction("👌", event.messageID, () => {}, true);

    // إرسال الصورة بعد 5 ثواني وحذفها بعد إرسالها
    setTimeout(function () {
      api.sendMessage({
        body: "AVATAR IMAGE",
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
  name: "اڤتار",
  author: "kaguya project",
  description: "يرسل صورة أفاتار بناءً على id, bgname, signature, color.\nمثال: 1 Joshua 'Joshua Sy' blue",
  aliases: ["أڤتار"],
  execute: avatarAlert
};
غير الرابط بهذا 
https://markdevs69v2.onrender.com/api/canvas/avatarwibu?id=1&bgname=YACOUBI%20&sig=HUSSEIN

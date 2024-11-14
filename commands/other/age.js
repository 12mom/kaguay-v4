import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment-timezone';

export default {
  name: "ارسمي",
  author: "kaguya project",
  role: "member",
  description: "توليد صور بناءً على الوصف.",
  async execute({ args, api, event }) {
    if (args.length === 0) {
      api.sendMessage("⚠️ | يرجى إدخال وصف لتوليد الصورة.", event.threadID, event.messageID);
      return;
    }

    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    try {
      const prompt = args.join(" ");

      // Translate text from Arabic to English if needed
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0] || prompt;

      // Use the new API URL for image generation
      const apiUrl = `https://hiroshi-api.onrender.com/ai/anime?prompt=${encodeURIComponent(translatedPrompt)}`;
      const startTime = Date.now();

      const apiResponse = await axios.get(apiUrl);
      const imageUrl = apiResponse?.data?.image_url;

      if (!imageUrl) {
        api.sendMessage("❌ | لم يتم العثور على أي صور بناءً على الوصف.", event.threadID, event.messageID);
        return;
      }

      // Download the image from the URL
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(process.cwd(), "/cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);

      const endTime = Date.now();
      const executionTime = (endTime - startTime) / 1000;
      const timeString = moment.tz(endTime, "Africa/Casablanca").format("hh:mm:ss A");
      const dateString = moment.tz(endTime, "Africa/Casablanca").format("YYYY-MM-DD");

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      api.sendMessage({
        body: `✅❪𝒈𝒆𝒏𝒆𝒓𝒂𝒕𝒆𝒅 𝒔𝒖𝒄𝒄𝒆𝒔𝒔𝒇𝒖𝒍𝒍𝒚❫✅\n\n⌬︙𝒆𝒙𝒆𝒄𝒖𝒕𝒊𝒐𝒏 𝒕𝒊𝒎𝒆 ➭『${executionTime}』s\n⌬︙𝖙𝖎𝖒𝖊 ➭『${timeString}』\n⌬︙𝖉𝖆𝖙𝖊 ➭『${dateString}』`,
        attachment: stream
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
    }
  }
};

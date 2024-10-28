import axios from 'axios';
import path from 'path';
import fs from 'fs-extra';

class VideoDownloader {
  name = 'اوتو';
  author = 'kaguya project';
  role = 'member';
  description = 'تنزيل مقاطع الفيديو من Facebook، YouTube، Instagram، وPinterest باستخدام رابط URL.';

  async execute({ api, event }) {
    api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

    const link = event.body; // استخدام الرابط المرسل
    const downloadingMsg = await api.sendMessage("⏳ | جاري تنزيل الفيديو...", event.threadID);

    try {
      // تحديد رابط API الخاص بـ samirxpikachu
      const apiUrl = `https://www.samirxpikachu.run.place/alldl?url=${encodeURIComponent(link)}`;

      // طلب البيانات من API
      const response = await axios.get(apiUrl);
      const mediaData = response.data;

      // تحقق مما إذا كان هناك فيديو متاح
      if (mediaData && mediaData.medias && mediaData.medias.length > 0) {
        const video = mediaData.medias.find(m => m.videoAvailable);
        
        if (video) {
          const videoPath = path.join(process.cwd(), 'cache', `${mediaData.title || 'video'}.mp4`);
          fs.ensureDirSync(path.join(process.cwd(), 'cache'));

          const videoStream = await axios({
            method: 'GET',
            url: video.url,
            responseType: 'stream'
          });

          const fileWriteStream = fs.createWriteStream(videoPath);
          videoStream.data.pipe(fileWriteStream);

          fileWriteStream.on('finish', async () => {
            await api.unsendMessage(downloadingMsg.messageID);
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
            await api.sendMessage({
              body: `✅ | تـم تـنـزيـل الـفـيـديو بـنـجـاح \n📝 | الـعـنـوان : ${mediaData.title || 'محتوى غير متوفر'}`,
              attachment: fs.createReadStream(videoPath)
            }, event.threadID);
            fs.unlinkSync(videoPath); // حذف الملف بعد الإرسال
          });

          fileWriteStream.on('error', async (error) => {
            console.error('[ERROR] أثناء كتابة الملف:', error);
            await api.unsendMessage(downloadingMsg.messageID);
            api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الفيديو.", event.threadID);
          });
        } else {
          await api.unsendMessage(downloadingMsg.messageID);
          api.sendMessage("⚠️ | لا يوجد فيديو متاح للتنزيل.", event.threadID);
        }
      } else {
        await api.unsendMessage(downloadingMsg.messageID);
        api.sendMessage("⚠️ | لا يوجد فيديو متاح للتنزيل.", event.threadID);
      }
    } catch (error) {
      console.error('Error fetching or sending video:', error);
      await api.unsendMessage(downloadingMsg.messageID);
      api.sendMessage("⚠️ | حدث خطأ أثناء جلب أو إرسال الفيديو.", event.threadID);
    }
  }

  async events({ api, event }) {
    const { body, threadID, senderID } = event;

    if (body && /^(https?:\/\/)?(www\.)?(facebook\.com|instagram\.com|pin\.it)\/.+$/.test(body)) {
      // إذا أرسل المستخدم رابط صالح، يمكن تفعيل `execute` مباشرة من هنا
      this.execute({ api, event });
    }
  }
}

export default new VideoDownloader();

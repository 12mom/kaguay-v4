import axios from "axios";
import fs from "fs";
import path from "path";
import process from "process";

export default {
  name: "قائمة",
  author: "Thiệu Trung Kiên",
  cooldowns: 50,
  description: "قائمة الأوامر",
  role: "member",
  aliases: ["menu", "قائمه"],
  execute: async ({ api, event }) => {
    api.setMessageReaction("📜", event.messageID, () => {}, true);

    // النص الخاص بالقائمة
    const messageText = `
    `\t\t\t\t\t\t\t༒☾قـــائــــمــــة الــاوامـــر☽༒ 
  

  ༺✿فــــئــــة الألــعــاب✿༻
  
  ❁تفكيك  ❁رأس_أو_وجه  ❁شارات  ❁حجر_ورقة_مقص  ❁شخصيات ❁ايموجي ❁الاسرع ❁اكس_او ❁حقيقة&جرأة ❁فزورة ❁تخمين 

          
༺فـــئـــة الاقــــتــــصــاد༻

❂عمل ❂هدية ❂نقاط ❂رصيدي ❂صرف ❂توب ❂كهف
          
༺فــــئــــة الـــــــخــــدمـــات༻
  
 ✺إزالة_الخلفية  ✺بيانات ✺ايدي ✺تعالو  
 ✺مزج ✺ارت ✺تلوين ✺ترجمي ✺تطقيم ✺تطقيم2 ✺ذكريني ✺تحميل ✺غني ✺يوتيوب ✺رابط ✺رابط2 ✺رابط3  ✺رابط4 ✺أخبار_الأنمي ✺أوبستايت ✺فيسبوك ✺تحميل 
 ✺الطقس ✺اقتصاص ✺ضيفيني ✺ملصق ✺غني ✺صور ✺جوجل ✺قرآن ✺كنية ✺تيد ✺اوامر ✺عمري ✺ويكيبيديا ✺إيموجي ✺المعرف ✺دمج ✺زخرفة  ✺جودة  ✺تحويل ✺آيدي ✺معلوماتي ✺نصيحة ✺اطرديني ✺انضمام ✺مشغول ✺لوغو
           
༺✿فــــئــــة الــــــذكـــاء✿༻
   
♔تخيلي ♔تخيلي2 ♔ارسمي ♔ارسمي2 ♔كاغويا ♔ذكاء 
♔نيجي ♔تشابه ♔برومبت
           
༺✿فــــئــــة الــــمـــتـــعـــة✿༻
  
❀رقص ❀افلام ❀كراش ❀شاذ ❀سيجما ❀أنمي2 ❀اقتباس ❀شخصيتي ❀مقطع_أنمي ❀إعجاب ❀زوجيني ❀نيزكو ❀اصفعي ❀آيفون ❀علمني ❀حضن ❀اعجاب ❀أزياء ❀قولي ❀ونبيس ❀قبر ❀فتيات ❀مرحاض ❀زواج ❀غموض ❀طلب ❀ماذا_لو ❀خلفيات ❀سبيدرمان ❀شنق ❀مطلوب ❀انميات ❀تحدي ❀شخصيتي_السينمائية ❀زوجة
❀ زوجيني2 ❀زوجيني3 ❀زوجيني4 ❀سيلفي ❀عناق2 ❀حيواني ❀قبلة ❀حيواني ❀ضرب 
༺✿فــــئــــة الـــــمــــطـــور✿༻
  
♛قبول ♛طلبات ♛غادري ♛المطور ♛موافقة ♛المتجر ♛آدمن ♛رد_الآدمن ♛تجربة ♛ضبط_البادئة ♛كمند ♛بايو ♛المجموعة ♛تصفية ♛إشعار ♛اوبتايم ♛ڤيو ♛شرح ♛المستخدم ♛مشاركة ♛لاست
          
༺فــــئــــة الـــمــجــمــوعــة༻
  
❆حماية_الإسم ❆حماية_الصورة ❆ضبط_إيموجي ❆ضبط_الصورة ❆ضبط_الإسم
          
༺✿أوٌآمــر إضــآفــيــةّ✿༻

 ☠مثير ☠تطبيقات ☠شوتي 

\t\t<┈┈┈ ⋞ 〈 ⏣ 〉 ⋟ ┈┈┈┈>
    `;

    // تحديد مسار الصورة المؤقتة
    const imagePath = path.join(process.cwd(), "cache", "neko_image.png");

    try {
      // جلب بيانات الصورة من الـ API
      const apiResponse = await axios.get(
        "https://jerome-web.gleeze.com/service/api/neko?type=png&amount=1"
      );

      if (apiResponse.data.success && apiResponse.data.data.length > 0) {
        const nekoImageUrl = apiResponse.data.data[0].url; // رابط الصورة
        const nekoArtist = apiResponse.data.data[0].artist_name; // اسم الفنان
        const nekoSource = apiResponse.data.data[0].source_url; // رابط المصدر

        // تحميل الصورة
        const response = await axios({
          url: nekoImageUrl,
          responseType: "stream",
        });

        // حفظ الصورة في المسار المؤقت
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on("finish", () => {
          // إرسال القائمة مع الصورة
          api.sendMessage(
            {
              body: `${messageText}`,
              attachment: fs.createReadStream(imagePath),
            },
            event.threadID,
            () => {
              // حذف الصورة بعد الإرسال
              fs.unlinkSync(imagePath);
            },
            event.messageID
          );
        });

        writer.on("error", (err) => {
          console.error("Error writing the image to disk: ", err);
          api.sendMessage(
            "حدث خطأ أثناء حفظ الصورة.",
            event.threadID,
            event.messageID
          );
        });
      } else {
        api.sendMessage(
          "⚠️ | لم يتم العثور على صورة مناسبة.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error("Error fetching the neko image: ", error);
      api.sendMessage(
        "⚠️ | حدث خطأ أثناء جلب الصورة.",
        event.threadID,
        event.messageID
      );
    }
  },
};

// listenMqtt.js - بوت مسنجر مع MQTT (نسخة آمنة)

const mqtt = require('mqtt');
const axios = require('axios'); // لربط بوت الماسنجر

// --------------------
// 1. إعدادات MQTT
// --------------------
const MQTT_BROKER = 'mqtt://broker.hivemq.com'; // يمكنك تغييره
const MQTT_TOPIC = 'messenger/requests';

// --------------------
// 2. دالة التعامل مع الرسائل الواردة (من MQTT)
// --------------------
function handleMessage(topic, message) {
  try {
    console.log(`[MQTT] رسالة واردة من ${topic}: ${message.toString()}`);

    const data = JSON.parse(message.toString());

    // تأكد أن البيانات تحتوي على user_id وtext
    if (data.user_id && data.text) {
      sendMessengerReply(data.user_id, data.text);
    }

  } catch (err) {
    console.error('[MQTT] خطأ في معالجة الرسالة:', err.message);
  }
}

// --------------------
// 3. دالة إرسال رد عبر Facebook Graph API
// --------------------
async function sendMessengerReply(userId, userText) {
  const PAGE_ACCESS_TOKEN = 'EAAP...'; // ⚠️ ضع توكن الصفحة هنا

  // مثال بسيط للرد
  let reply = "تم استلام رسالتك: " + userText;

  try {
    await axios.post(
      `https://graph.facebook.com/v20.0/me/messages`,
      {
        recipient: { id: userId },
        message: { text: reply },
      },
      {
        params: { access_token: PAGE_ACCESS_TOKEN },
        headers: { 'Content-Type': 'application/json' },
      }
    );
    console.log(`[ماسنجر] رد تمت إرساله للمستخدم ${userId}`);
  } catch (error) {
    console.error('[ماسنجر] فشل في إرسال الرسالة:', error.response?.data || error.message);
  }
}

// --------------------
// 4. اتصال MQTT مع التحقق من الأخطاء
// --------------------
function connectMqtt() {
  console.log('[MQTT] جارٍ الاتصال بالخادم...');

  const client = mqtt.connect(MQTT_BROKER);

  client.on('connect', () => {
    console.log('[MQTT] متصل بالخادم بنجاح');
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('[MQTT] خطأ في الاشتراك:', err);
      } else {
        console.log(`[MQTT] مشترك في الموضوع: ${MQTT_TOPIC}`);
      }
    });
  });

  // ✅ التحقق من أن handleMessage دالة قبل استخدامها
  client.on('message', (topic, message) => {
    if (typeof handleMessage === 'function') {
      handleMessage(topic, message);
    } else {
      console.error('[MQTT] الدالة handleMessage غير معرفة أو ليست دالة');
    }
  });

  client.on('error', (err) => {
    console.error('[MQTT] خطأ في الاتصال:', err);
  });

  client.on('reconnect', () => {
    console.log('[MQTT] إعادة الاتصال...');
  });

  return client;
}

// --------------------
// 5. تشغيل البوت
// --------------------
const mqttClient = connectMqtt();

// ✅ حماية من ERR_INVALID_ARG_TYPE
process.on('uncaughtException', (err) => {
  if (err.code === 'ERR_INVALID_ARG_TYPE') {
    console.error('[نظام] تم منع خطأ ERR_INVALID_ARG_TYPE:', err.message);
    console.error('[نظام] تأكد من أن كل event listener هو دالة صالحة.');
  } else {
    throw err; // لا تمنع الأخطاء الأخرى
  }
});

console.log('[البوت] بوت الماسنجر يعمل الآن مع MQTT ✅');

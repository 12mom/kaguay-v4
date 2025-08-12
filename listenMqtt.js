// listenMqtt.js — نسخة آمنة للعمل على Render

const mqtt = require('mqtt');

// ------------------------------
// 1. تحقق من التوكن والبيئة
// ------------------------------
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
if (!PAGE_ACCESS_TOKEN) {
  console.warn('[تحذير] لم يتم تعيين PAGE_ACCESS_TOKEN في البيئة. بعض الميزات لن تعمل.');
}

// ------------------------------
// 2. دالة التعامل مع الرسائل (MQTT)
// ------------------------------
function handleMessage(topic, message) {
  try {
    console.log(`[MQTT] رسالة من الموضوع: ${topic}`);
    console.log(`[MQTT] المحتوى: ${message.toString()}`);

    // هنا يمكنك معالجة الرسالة، مثلاً إرسالها إلى ماسنجر
    // مثال: JSON.parse(message.toString()) ثم إرسال رد

  } catch (err) {
    console.error('[MQTT] خطأ في معالجة الرسالة:', err.message);
  }
}

// ------------------------------
// 3. دالة آمنة للاتصال بـ MQTT
// ------------------------------
function connectMqtt() {
  const brokerUrl = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
  const topic = process.env.MQTT_TOPIC || 'messenger/incoming';

  console.log(`[MQTT] جارٍ الاتصال بالخادم: ${brokerUrl}`);

  let client;

  try {
    client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
      console.log('[MQTT] الاتصال ناجح');
      if (typeof client.subscribe === 'function') {
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`[MQTT] فشل في الاشتراك في ${topic}:`, err.message);
          } else {
            console.log(`[MQTT] مشترك في: ${topic}`);
          }
        });
      }
    });

    // ✅ التحقق من أن handleMessage دالة قبل استدعاءها
    client.on('message', (receivedTopic, message) => {
      if (typeof handleMessage === 'function' && handleMessage instanceof Function) {
        handleMessage(receivedTopic, message);
      } else {
        console.error('[MQTT] handleMessage ليست دالة صالحة:', typeof handleMessage);
      }
    });

    client.on('error', (err) => {
      console.error('[MQTT] خطأ في الاتصال:', err.message);
    });

    client.on('reconnect', () => {
      console.log('[MQTT] إعادة الاتصال جارٍ...');
    });

    return client;

  } catch (err) {
    console.error('[MQTT] فشل في إنشاء اتصال MQTT:', err.message);
    return null;
  }
}

// ------------------------------
// 4. تشغيل الاتصال فقط إذا كنا في بيئة رئيسية
// ------------------------------
if (require.main === module) {
  // هذا الشرط يمنع التنفيذ عند الاستيراد كـ module
  console.log('[البوت] تشغيل خدمة MQTT...');

  // ✅ تأكد أن الدالة موجودة
  if (typeof connectMqtt === 'function') {
    const mqttClient = connectMqtt();

    // تصدير للإستخدام في ملفات أخرى
    module.exports = mqttClient;
  } else {
    console.error('[نظام] connectMqtt ليست دالة!');
  }
} else {
  // إذا استُخدم كوحدة (require)، سجّل ذلك
  console.log('[MQTT] تم استيراد الوحدة بنجاح (غير نشط الآن)');
  module.exports = connectMqtt;
}

// ------------------------------
// 5. منع الأخطاء المفاجئة
// ------------------------------
process.on('uncaughtException', (err) => {
  if (err.code === 'ERR_INVALID_ARG_TYPE') {
    console.error('[نظام] تم اصطياد ERR_INVALID_ARG_TYPE:');
    console.error('الرسالة:', err.message);
    console.error('الدالة التتبع:', err.stack);
    console.log('[نظام] البوت سيحاول الاستمرار... (أو إعادة التشغيل)');
    // لا تتوقف — Render سيُعيد التشغيل تلقائيًا
  } else {
    console.error('[نظام] خطأ غير متوقع:', err);
    process.exit(1); // أخرج فقط للأخطاء الحرجة
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[نظام] Rejection غير معالج:', reason);
});

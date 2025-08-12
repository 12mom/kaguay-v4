client.on('message', (message) => {
  const body = message.body?.trim();

  if (body.startsWith("!اخترق") || body.startsWith("!hack")) {
    // احصل على المستخدم الموجه إليه الأمر (مثل @mention)
    const mention = message.mentions ? Object.keys(message.mentions)[0] : null;
    const targetName = mention ? message.mentions[mention].replace("@", "") : message.senderName;

    // رسالة "الاختراق الوهمي"
    const hackMessage = `
🧩 *نظام الاختراق الوهمي - snfor v1.0* 🧩
──────────────────────
🟢

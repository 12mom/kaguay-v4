client.on('message', async (message) => {
  const body = message.body?.toLowerCase();

  if (body === "!حب" || body === "يا snfor" || body === "!snfor") {
    const reply = `
💙 *أحبكم يا سنافري!* 💙
من: *حمودي سان 🇸🇩*
فيسبوك: fb.com/babasnfor80
البوت جاهز لخدمتك دايمًا ❤️
    `;
    message.reply(reply);
  }
});

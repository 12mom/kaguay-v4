if (body === "!انمي") {
  const animePics = [
    "https://i.imgur.com/55sNlYv.jpg",
    "https://i.imgur.com/ABC123.jpg"
  ];
  message.reply({
    body: "🎨 صورة انمي من snfor",
    attachment: animePics[Math.floor(Math.random() * animePics.length)]
  });
}

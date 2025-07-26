// renameBotName.js
const fs = require("fs");
const path = require("path");

const commandsDir = path.join(__dirname, "commands");
const oldNames = [/كاغويا/gi, /kaguya/gi];
const newName = "Dora Bot";

function updateBotNameInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let updated = content;

  oldNames.forEach(regex => {
    updated = updated.replace(regex, newName);
  });

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`🤖 تم تغيير اسم البوت في: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith(".js")) {
      updateBotNameInFile(fullPath);
    }
  });
}

walk(commandsDir);

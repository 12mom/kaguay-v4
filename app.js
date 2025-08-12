import express from "express";
import config from "./KaguyaSetUp/config.js";
import { log } from "./logger/index.js";
import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// تحديد __dirname في نظام ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// إنشاء تطبيق Express
const app = express();

// تحديد المنفذ: أولوية لـ process.env.PORT (مهم لـ Render)
const PORT = process.env.PORT || config.port || 8040;

// روت رئيسي لعرض صفحة ترحيب
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "./utils/index.html"));
});

// تشغيل الخادم
app.listen(PORT, () => {
  log([
    {
      message: "[ EXPRESSJS ]: ",
      color: "green",
    },
    {
      message: `Listening on port: ${PORT}`,
      color: "white",
    },
  ]);
});

// وظيفة لإعادة تشغيل البوت تلقائيًا إذا توقف
function startBotProcess(script) {
  const child = spawn(
    "node",
    ["--trace-warnings", "--async-stack-traces", script],
    {
      cwd: __dirname,
      stdio: "inherit",
      shell: true,
    }
  );

  child.on("close", (codeExit) => {
    console.log(`${script} process exited with code: ${codeExit}`);
    if (codeExit !== 0) {
      setTimeout(() => startBotProcess(script), 3000);
    }
  });

  child.on("error", (error) => {
    console.error(
      `An error occurred starting the ${script} process: ${error}`
    );
  });
}

// تشغيل البوت الرئيسي
startBotProcess("index.js");

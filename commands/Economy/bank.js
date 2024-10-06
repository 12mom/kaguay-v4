import fs from 'fs';
import path from 'path';

export default {
  name: "بنك",
  author: "Kaguya Project",
  role: "user",
  description: "أوامر البنك المختلفة (رصيدي، إيداع، سحب، تحويل، قرض، دفع_القرض).",
  
  async execute({ event, args, api, Economy }) {
    const { getBalance, increase, decrease } = Economy;
    const userID = event.senderID;
    const command = args[0];
    const amount = parseFloat(args[1], 10);
    const recipientUID = args[2]; // مستخدم المستلم في حالة التحويل
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "Unknown";
    
    // التأكد من وجود threadID
    if (!event.threadID) {
      return api.sendMessage("حدث خطأ، لا يمكن تحديد المحادثة.", event.threadID);
    }

    // تحديد مسار ملف البنك
    const bankFilePath = path.join(process.cwd(), 'bank.json');

    // التأكد من وجود ملف البنك
    if (!fs.existsSync(bankFilePath)) {
      fs.writeFileSync(bankFilePath, JSON.stringify({}));
    }

    // قراءة بيانات البنك
    const bankData = JSON.parse(fs.readFileSync(bankFilePath, 'utf8'));

    // تسجيل المستخدم إذا لم يكن مسجلاً
    if (!bankData[userID]) {
      bankData[userID] = { bank: 100, lastInterestClaimed: Date.now(), loan: 0, loanDueDate: 0 };
      fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
      return api.sendMessage(`أهلاً ${userName}! تم تسجيلك في البنك برصيد ابتدائي قدره 100 دولار \n اكتب بنك ثانية لترى اوامر البنك المتاحة`, event.threadID);
    }

    switch (command) {
      case "رصيدي":
        return api.sendMessage(`رصيد حسابك البنكي هو ${bankData[userID].bank.toFixed(2)} دولار.`, event.threadID);

      case "إيداع":
        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage("الرجاء إدخال المبلغ الذي ترغب في إيداعه.", event.threadID);
        }
        try {
          await decrease(amount, userID);
          bankData[userID].bank += amount;
          fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
          return api.sendMessage(`تم إيداع ${amount.toFixed(2)} دولار في حسابك البنكي.`, event.threadID);
        } catch (error) {
          return api.sendMessage(`حدث خطأ أثناء إيداع المبلغ: ${error.message}`, event.threadID);
        }

      case "سحب":
        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage("الرجاء إدخال المبلغ الذي ترغب في سحبه.", event.threadID);
        }
        if (bankData[userID].bank < amount) {
          return api.sendMessage("ليس لديك ما يكفي من المال.", event.threadID);
        }
        try {
          await increase(amount, userID);
          bankData[userID].bank -= amount;
          fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
          return api.sendMessage(`تم سحب ${amount.toFixed(2)} دولار من حسابك البنكي.`, event.threadID);
        } catch (error) {
          return api.sendMessage(`حدث خطأ أثناء سحب المبلغ: ${error.message}`, event.threadID);
        }

      case "الفائدة":
        const interestRate = 0.0001; // معدل الفائدة اليومي
        const lastInterestClaimed = bankData[userID].lastInterestClaimed || Date.now();
        const currentTime = Date.now();
        const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;
        const interestEarned = bankData[userID].bank * (interestRate / 86400) * timeDiffInSeconds; // حساب الفائدة
        bankData[userID].lastInterestClaimed = currentTime;
        bankData[userID].bank += interestEarned;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`✧ تهانينا ${userName}! لقد كسبت ${interestEarned.toFixed(2)}💵 كفائدة من الإيداع. لقد تم إضافة المبلغ بنجاح إلى حسابك البنكي.`, event.threadID);

      case "تحويل":
        if (isNaN(amount) || amount <= 0 || isNaN(recipientUID)) {
          return api.sendMessage(`${lianeBank}\n\n✧ مرحبا يا ${userName}! أرجوك قم بإدخال الكمية بعدها آيدي المستخدم الذي تريد تحويل الأموال إليه.\n\nخيارات إضافية:\n⦿ بنك2 الرصيد\n⦿ رصيدي\n⦿ آيدي`, event.threadID);
        }
        if (bankData[userID].bank < amount) {
          return api.sendMessage(`${lianeBank}\n\n✧ آسف يا ${userName}, المبلغ الذي تريد تحويله أكبر من الرصيد المتاح لديك في حسابك البنكي. الرجاء التحقق من رصيدك والمحاولة مرة أخرى.\n\nخيارات إضافية:\n⦿ بنك2 الرصيد\n⦿ رصيدي`, event.threadID);
        }
        if (!bankData[recipientUID]) {
          bankData[recipientUID] = { bank: 0, lastInterestClaimed: Date.now(), loan: 0, loanDueDate: 0 };
        }
        bankData[userID].bank -= amount;
        bankData[recipientUID].bank += amount;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`✧ تحياتي يا ${userName}! لقد تم تحويل ${amount.toFixed(2)}💵 إلى المستخدم ${recipientUID} بنجاح ✅\n\n✧ الكمية: ${amount.toFixed(2)}💵\n✧ آيدي المستقبل: ${recipientUID}\n\n✧ قرض البنك ✅`, event.threadID);

      case "قرض":
        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage(`${lianeBank}\n\n✧ مرحبا يا ${userName}! الرجاء إدخال المبلغ الذي ترغب في اقتراضه.\n\nخيارات إضافية:\n⦿ بنك2 الرصيد\n⦿ رصيدي`, event.threadID);
        }
        if (bankData[userID].loan > 0) {
          return api.sendMessage(`${lianeBank}\n\n✧ آسف يا ${userName} لكن أنت بالفعل لديك قرض.\n\nمزيد من الخيارات:\n⦿ بنك دفع_القرض\n⦿ بنك الرصيد`, event.threadID);
        }
        if (amount > 1000000) {
          return api.sendMessage(`${lianeBank}\n\n✧ آسف يا ${userName}, الحد الأقصى للقرض هو 1000000.\n\nمزيد من الخيارات:\n⦿ بنك دفع_القرض\n⦿ بنك الرصيد`, event.threadID);
        }
        bankData[userID].loan = amount;
        bankData[userID].loanDueDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // تاريخ الاستحقاق بعد أسبوع
        bankData[userID].bank += amount;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`✧ مرحبا يا ${userName}, لقد قمت بإقتراض مبلغ قدره ${amount.toFixed(2)}💵. سيتم خصم مبلغ القرض من رصيد حسابك البنكي بعد أسبوع واحد.\n\nخيارات إضافية:\n⦿ بنك دفع_القرض\n⦿ بنك الرصيد`, event.threadID);

      case "دفع_القرض":
        const loan = bankData[userID].loan || 0;
        const loanDueDate = bankData[userID].loanDueDate || 0;

        if (loan <= 0 || loanDueDate <= 0) {
          return api.sendMessage(`${lianeBank}\n\n✧ آسف يا ${userName}, أنت لم تقم بأخذ أي قرض من قبل.\n\nمزيد من الخيارات:\n⦿ بنك2 الرصيد\n⦿ رصيدي`, event.threadID);
        }

        const daysLate = Math.ceil((Date.now() - loanDueDate) / (24 * 60 * 60 * 1000));
        const interestRatePerDay = 0.002; // 0.2% يومياً
        const interest = loan * interestRatePerDay * daysLate;
        const totalAmountDue = loan + interest;

        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage(`${lianeBank}\n\n✧ مرحبا بعودتك ${userName}! الرجاء إدخال المبلغ الذي ترغب في دفعه. المبلغ الإجمالي المستحق هو ${totalAmountDue.toFixed(2)}💵.\n\nمزيد من الخيارات:\n⦿ بنك2 الرصيد\n⦿ رصيدي`, event.threadID);
        }
        const userBalance = bankData[userID].bank || 0;
        if (amount > userBalance) {
          return api.sendMessage(`${lianeBank}\n\n✧ آسف يا ${userName}, لا يوجد لديك ما يكفي من المال لدفع القرض.\n\nمزيد من الخيارات:\n⦿ بنك2 الرصيد\n⦿ رصيدي`, event.threadID);
        }
        if (amount < totalAmountDue) {
          return api.sendMessage(`${lianeBank}\n\n✧ آسف يا ${userName}, المبلغ الذي أدخلته أقل من المبلغ الإجمالي المستحق وهو ${totalAmountDue.toFixed(2)}💵.\n\nمزيد من الخيارات:\n⦿ بنك الرصيد\n⦿ بنك دفع_القرض`, event.threadID);
        }
        bankData[userID].loan = 0;
        bankData[userID].loanDueDate = 0;
        bankData[userID].bank -= totalAmountDue;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`✧ تهانينا يا ${userName}, لقد قمت بدفع قرض قدره ${loan.toFixed(2)}💵 بالإضافة إلى الفائدة ${interest.toFixed(2)}💵. المبلغ الإجمالي المدفوع هو ${totalAmountDue.toFixed(2)}💵.\n\nمزيد من الخيارات:\n⦿ بنك الرصيد\n⦿ بنك2 قرض`, event.threadID);

      default:
        return api.sendMessage(`❍───────────────❍
\t\t\t\t🏦𝙱𝙰𝙽𝙺 𝙺𝙰𝙶𝙺𝙰𝚈𝙰🏦

بنك رصيدي : لعرض رصيدك البنك
بنك إيداع [الكمية]: لإيداع الأموال
بنك سحب [الكمية]: لسحب الأموال
بنك الفائدة : لحساب وإضافة الفائدة على رصيدك
بنك تحويل [الكمية] [آيدي]: لتحويل الأموال إلى مستخدم آخر
بنك قرض [الكمية]: للحصول على قرض
بنك دفع_القرض [الكمية]: لسداد القرض
❍───────────────❍`, event.threadID);
    }
  }
};

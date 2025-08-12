import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('database/levelDB.json');

// تحميل قاعدة البيانات
const loadDB = () => {
  if (fs.existsSync(dbPath)) {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  return {};
};

// حفظ قاعدة البيانات
const saveDB = (db) => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
};

// حساب إذا صعد مستوى
const getLevel = (xp) => Math.floor(Math.sqrt(xp) / 5) + 1;
const getXPForNextLevel = (level) => (level * 5) ** 2;

// أسماء المستويات
const levelNames = [
  "مبتدئ", "ناشئ", "محترف", "ملك الشات", "أسطورة",
  "إله الميمز", "حاكم السنافري", "ملك snfor", "الأسطوري", "الخالد"
];

export const addXP = (senderID, senderName) => {
  const db = loadDB();

  if (!db[senderID]) {
    db[senderID] = { xp: 0, level: 1, name: senderName };
  }

  // إضافة XP عشوائي (1-10) + مكافأة على الإيموجي
  const baseXP = Math.floor(Math.random() * 10) + 1;
  const emojiBonus = (senderName.match(/[\p{Emoji}]/gu) || []).length * 2;
  const totalXP = baseXP + emojiBonus;

  db[senderID].xp += totalXP;
  const oldLevel = db[senderID].level;
  db[senderID].level = getLevel(db[senderID].xp);
  db[senderID].name = senderName;

  const levelUp = db[senderID].level > oldLevel;

  saveDB(db);

  return { levelUp, oldLevel: oldLevel, newLevel: db[senderID].level };
};

export const getRank = (senderID) => {
  const db = loadDB();
  if (!db[senderID]) return null;

  const users = Object.entries(db).sort((a, b) => b[1].xp - a[1].xp);
  const rank = users.findIndex(([id]) => id === senderID) + 1;

  return {
    xp: db[senderID].xp,
    level: db[senderID].level,
    rank: rank,
    totalUsers: users.length,
    levelName: levelNames[db[senderID].level - 1] || "الخالد"
  };
};

export const getLeaderboard = () => {
  const db = loadDB();
  const users = Object.entries(db)
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 10);

  return users.map(([id, data], i) => ({
    rank: i + 1,
    name: data.name,
    level: data.level,
    xp: data.xp
  }));
};

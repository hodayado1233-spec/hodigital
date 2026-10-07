# מעקב ביטויים (Cloudflare)

המערכת יושבת ב-Cloudflare, בכתובת נפרדת מהאתר: `https://hodigital-ranks.<החשבון>.workers.dev`.
הכניסה לדשבורד מוגנת בסיסמה.

- **סריקה:** כל 10 דקות רצה מנה של ביטויים שעוד לא נבדקו היום, עד שכל הביטויים נבדקו. אחר כך היא לא עושה כלום עד מחר.
- **נתונים:** מסד הנתונים `hodigital-ranks` (D1) בחשבון ה-Cloudflare.
- **ניהול לקוחות וביטויים:** ישירות מהדשבורד.
- **דוח חודשי:** בתחתית הדשבורד, בחירת חודש ואז ייצוא לאקסל או דוח להדפסה / PDF.
- **תצוגת דוגמה עם נתונים מומצאים:** מוסיפים `?demo=1` לכתובת.

## העלאה ראשונה (הדבקה ידנית, בלי טרמינל)

מסד הנתונים `hodigital-ranks` כבר קיים בחשבון עם כל הטבלאות.

1. **יצירת ה-Worker:** ב-Cloudflare נכנסים ל-**Workers & Pages → Create → Start with Hello World**, קוראים לו `hodigital-ranks` ולוחצים **Deploy**.
2. **הדבקת הקוד:** לוחצים **Edit code**, מוחקים את כל מה שיש בעורך, מדביקים את כל התוכן של `dist/worker.js` ולוחצים **Deploy**.
3. **חיבור מסד הנתונים:** ב-Worker נכנסים ל-**Settings → Bindings → Add → D1 database**.
   - Variable name: `DB` (באותיות גדולות)
   - D1 database: `hodigital-ranks`
4. **סודות:** ב-**Settings → Variables and Secrets → Add** מוסיפים שניים, ובכל אחד בוחרים Type = **Secret**:
   - `DASHBOARD_PASSWORD`: הסיסמה לדשבורד
   - `SERPER_API_KEY`: המפתח מ-[serper.dev](https://serper.dev). אפשר להוסיף אותו גם מאוחר יותר.
5. **סריקה אוטומטית:** ב-**Settings → Trigger Events → Add → Cron Triggers** מזינים `*/10 * * * *` (כל 10 דקות).
6. **כניסה:** הכתובת מופיעה ב-**Settings → Domains & Routes** (מסתיימת ב-`workers.dev`). בכניסה הדפדפן יבקש שם משתמש וסיסמה: שם המשתמש לא משנה, רק הסיסמה.

כשמשנים קוד בעתיד: מריצים `npm run build:paste` ומדביקים מחדש את `dist/worker.js` (שלב 2 בלבד).

## עלות

- Cloudflare: חינם (התוכנית החינמית מספיקה).
- Serper: כל עמוד תוצאות (10 תוצאות) הוא בדיקה אחת. ביטוי בעמוד הראשון עולה בדיקה אחת, ביטוי שלא נמצא עד מקום 50 עולה 5.
  100 ביטויים יוצאים בערך 5–8 דולר בחודש. יש 2,500 בדיקות חינם בהתחלה.

## הגדרות

ב-`wrangler.toml`: `MAX_DEPTH` (עד איזה מקום בודקים, ברירת מחדל 50), `COUNTRY` ו-`LANGUAGE` (גוגל ישראל בעברית).

## בדיקה מקומית

`npm run db:init:local`, ואז `npx wrangler dev` עם קובץ `.dev.vars` שמכיל `SERPER_API_KEY` ו-`DASHBOARD_PASSWORD`.

# מעקב ביטויים (Cloudflare)

המערכת יושבת ב-Cloudflare, בכתובת נפרדת מהאתר: `https://hodigital-ranks.<החשבון>.workers.dev`.
הכניסה לדשבורד מוגנת בסיסמה.

- **סריקה:** כל 10 דקות רצה מנה של ביטויים שעוד לא נבדקו היום, עד שכל הביטויים נבדקו. אחר כך היא לא עושה כלום עד מחר.
- **נתונים:** מסד הנתונים `hodigital-ranks` (D1) בחשבון ה-Cloudflare.
- **ניהול לקוחות וביטויים:** ישירות מהדשבורד.
- **דוח חודשי:** בתחתית הדשבורד, בחירת חודש ואז ייצוא לאקסל או דוח להדפסה / PDF.
- **תצוגת דוגמה עם נתונים מומצאים:** מוסיפים `?demo=1` לכתובת.

## העלאה ראשונה

1. ב-Cloudflare: **My Profile → API Tokens → Create Token**, תבנית **Edit Cloudflare Workers**, ולהוסיף הרשאה **D1: Edit**.
2. לשמור את הטוקן בהגדרות הסביבה של Claude Code בשם `CLOUDFLARE_API_TOKEN`, לפתוח שיחה חדשה ולבקש מ-Claude להעלות את המערכת.
   או להריץ בעצמך מתוך התיקייה הזו: `npm install` ואחריו `npx wrangler deploy`.
3. אחרי ההעלאה, ב-Cloudflare: **Workers & Pages → hodigital-ranks → Settings → Variables and Secrets** ולהוסיף שני סודות (Secret):
   - `SERPER_API_KEY`: המפתח מ-[serper.dev](https://serper.dev)
   - `DASHBOARD_PASSWORD`: הסיסמה לדשבורד. בכניסה הדפדפן יבקש שם משתמש וסיסמה: שם המשתמש לא משנה, רק הסיסמה.

## עלות

- Cloudflare: חינם (התוכנית החינמית מספיקה).
- Serper: כל עמוד תוצאות (10 תוצאות) הוא בדיקה אחת. ביטוי בעמוד הראשון עולה בדיקה אחת, ביטוי שלא נמצא עד מקום 50 עולה 5.
  100 ביטויים יוצאים בערך 5–8 דולר בחודש. יש 2,500 בדיקות חינם בהתחלה.

## הגדרות

ב-`wrangler.toml`: `MAX_DEPTH` (עד איזה מקום בודקים, ברירת מחדל 50), `COUNTRY` ו-`LANGUAGE` (גוגל ישראל בעברית).

## בדיקה מקומית

`npm run db:init:local`, ואז `npx wrangler dev` עם קובץ `.dev.vars` שמכיל `SERPER_API_KEY` ו-`DASHBOARD_PASSWORD`.

# מעקב ביטויים (Cloudflare + Google Search Console)

המערכת יושבת ב-Cloudflare, בכתובת נפרדת מהאתר: https://hodigital-ranks.hodayado1233.workers.dev/
הכניסה לדשבורד מוגנת בסיסמה.

- **מקור הנתונים:** Google Search Console. לכל ביטוי: מיקום ממוצע, קליקים, חשיפות ודף הנחיתה (הדף עם הכי הרבה חשיפות).
- **עדכון:** פעם ביום, אוטומטית. לקוח או ביטוי חדש מקבלים מיד היסטוריה של 90 יום.
- **איחור בנתונים:** גוגל מעדכנת את Search Console באיחור של יומיים-שלושה, אז הנתונים תמיד עד לפני כמה ימים.
- **ניהול לקוחות וביטויים:** ישירות מהדשבורד.
- **דוח חודשי:** בתחתית הדשבורד, בחירת חודש ואז ייצוא לאקסל או דוח להדפסה / PDF.
- **תצוגת דוגמה עם נתונים מומצאים:** מוסיפים `?demo=1` לכתובת.

## חיבור ל-Search Console (פעם אחת)

ב-[Google Cloud Console](https://console.cloud.google.com/):

1. **פרויקט:** למעלה, ליד הלוגו, בוחרים פרויקט ← **New Project** ← שם `hodigital-ranks` ← **Create**.
2. **הפעלת ה-API:** בחיפוש למעלה מקלידים **Google Search Console API**, נכנסים ולוחצים **Enable**.
3. **Service Account:** בחיפוש מקלידים **Service Accounts** ← **Create service account** ← שם `rank-tracker` ← **Create and continue** ← **Done** (בלי לבחור תפקיד).
4. **מפתח:** לוחצים על ה-Service Account שנוצר ← לשונית **Keys** ← **Add key** ← **Create new key** ← **JSON** ← **Create**. יורד קובץ JSON.
5. מעתיקים את כתובת המייל של ה-Service Account (מסתיימת ב-`iam.gserviceaccount.com`).

ב-Cloudflare (**Workers & Pages → hodigital-ranks → Settings → Variables and Secrets → Add**):

6. Type = **Secret**, שם `GSC_SERVICE_ACCOUNT`, ובערך מדביקים את **כל** התוכן של קובץ ה-JSON. אפשר למחוק את הסוד `SERPER_API_KEY` אם הוספת אותו.

ב-[Search Console](https://search.google.com/search-console), לכל אתר שרוצים לעקוב אחריו:

7. **הגדרות ← משתמשים והרשאות ← הוספת משתמש**, מדביקים את כתובת המייל של ה-Service Account, הרשאה **מוגבלת**.

אם אין גישה לאתר של לקוח, הדשבורד יציג הודעה אדומה עם הכתובת שצריך להוסיף.

## העלאת קוד (הדבקה ידנית)

1. ב-Worker: **Edit code**, מוחקים הכול, מדביקים את התוכן של `dist/worker.js` ולוחצים **Deploy**.
2. בהגדרות צריכים להיות: Binding מסוג D1 בשם `DB` למסד `hodigital-ranks`, הסודות `DASHBOARD_PASSWORD` ו-`GSC_SERVICE_ACCOUNT`, ו-Cron Trigger `*/10 * * * *`.

כשמשנים קוד: `npm run build:paste` ואז מדביקים מחדש את `dist/worker.js`.

## עלות

חינם: Cloudflare בתוכנית החינמית ו-Search Console API בלי תשלום.

## בדיקה מקומית

`npm run db:init:local`, ואז `npx wrangler dev` עם קובץ `.dev.vars` שמכיל `DASHBOARD_PASSWORD` ו-`GSC_SERVICE_ACCOUNT`.

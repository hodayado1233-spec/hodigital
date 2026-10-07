# מעקב ביטויים (Cloudflare + Serper + Google Search Console)

המערכת יושבת ב-Cloudflare, בכתובת נפרדת מהאתר: https://hodigital-ranks.hodayado1233.workers.dev/
הכניסה לדשבורד מוגנת בסיסמה.

- **כל הלקוחות:** מסך ראשי עם שורה לכל לקוח: נראות, ביטויים בטופ 10, מיקום ממוצע, קליקים, גרף מגמה ושינוי מול לפני 7 ימים. לחיצה על לקוח פותחת את הביטויים שלו.
- **מיקום מדויק (Serper):** כל יום מ-07:00 (שעון ישראל) נבדק כל ביטוי בגוגל ישראל, כמו בגלישה בסתר, עד מקום 50. נשמרים המיקום ודף הנחיתה.
- **קליקים וחשיפות (Search Console, לא חובה):** נמשכים פעם ביום, עם היסטוריה של 90 יום. גוגל מעדכנת באיחור של יומיים-שלושה.
- **ירוק ואדום:** עלייה בירוק, ירידה באדום, ביום האחרון, ב-7 ימים וב-30 ימים.
- **ניהול לקוחות וביטויים:** ישירות מהדשבורד.
- **דוח חודשי:** במסך של לקוח, בחירת חודש ואז ייצוא לאקסל או דוח להדפסה / PDF.
- **תצוגת דוגמה עם נתונים מומצאים:** מוסיפים `?demo=1` לכתובת.

## מיקום מדויק (Serper)

1. נרשמים ב-[serper.dev](https://serper.dev) ומעתיקים את המפתח מ-**API Key**.
2. ב-Cloudflare: **Workers & Pages → hodigital-ranks → Settings → Variables and Secrets → Add**, Type = **Secret**, שם `SERPER_API_KEY`, ומדביקים את המפתח.

עלות: כל עמוד תוצאות (10 תוצאות) הוא בדיקה אחת. ביטוי בעמוד הראשון עולה בדיקה אחת, ביטוי שלא נמצא עד מקום 50 עולה 5.
100 ביטויים יוצאים בערך 5–8 דולר בחודש. יש 2,500 בדיקות חינם בהתחלה.

## קליקים וחשיפות מ-Search Console (לא חובה)

ב-[Google Cloud Console](https://console.cloud.google.com/):

1. **פרויקט:** למעלה, ליד הלוגו, בוחרים פרויקט ← **New Project** ← שם `hodigital-ranks` ← **Create**.
2. **הפעלת ה-API:** בחיפוש למעלה מקלידים **Google Search Console API**, נכנסים ולוחצים **Enable**.
3. **Service Account:** בחיפוש מקלידים **Service Accounts** ← **Create service account** ← שם `rank-tracker` ← **Create and continue** ← **Done** (בלי לבחור תפקיד).
4. **מפתח:** לוחצים על ה-Service Account שנוצר ← לשונית **Keys** ← **Add key** ← **Create new key** ← **JSON** ← **Create**. יורד קובץ JSON.
5. מעתיקים את כתובת המייל של ה-Service Account (מסתיימת ב-`iam.gserviceaccount.com`).

ב-Cloudflare (**Workers & Pages → hodigital-ranks → Settings → Variables and Secrets → Add**):

6. Type = **Secret**, שם `GSC_SERVICE_ACCOUNT`, ובערך מדביקים את **כל** התוכן של קובץ ה-JSON.

ב-[Search Console](https://search.google.com/search-console), לכל אתר שרוצים לעקוב אחריו:

7. **הגדרות ← משתמשים והרשאות ← הוספת משתמש**, מדביקים את כתובת המייל של ה-Service Account, הרשאה **מוגבלת**.

אם אין גישה לאתר של לקוח, הדשבורד יציג הודעה אדומה עם הכתובת שצריך להוסיף.

## העלאת קוד (הדבקה ידנית)

1. ב-Worker: **Edit code**, מוחקים הכול, מדביקים את התוכן של `dist/worker.js` ולוחצים **Deploy**.
2. בהגדרות צריכים להיות: Binding מסוג D1 בשם `DB` למסד `hodigital-ranks`, הסודות `DASHBOARD_PASSWORD`, `SERPER_API_KEY` ו-`GSC_SERVICE_ACCOUNT` (לא חובה), ו-Cron Trigger `*/10 * * * *`.

כשמשנים קוד: `npm run build:paste` ואז מדביקים מחדש את `dist/worker.js`.

## עלות

Cloudflare ו-Search Console בחינם. Serper לפי שימוש (ראו למעלה).

## בדיקה מקומית

`npm run db:init:local`, ואז `npx wrangler dev --test-scheduled` עם קובץ `.dev.vars` שמכיל `DASHBOARD_PASSWORD`, `SERPER_API_KEY` ו-`GSC_SERVICE_ACCOUNT`.

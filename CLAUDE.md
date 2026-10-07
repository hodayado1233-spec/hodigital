# HODIGITAL – הנחיות עבודה

## כלל ראשי: עובדים רק דרך GitHub
- כל שינוי באתר HODIGITAL (hodi-digital.co.il) נעשה דרך GitHub בלבד: עריכת קוד ב-repo, commit, push לענף ו-Pull Request.
- **אסור** לבצע שינויים דרך Lovable (לא send_message, לא עריכה ישירה בפרויקט). ממשק Lovable משמש לכל היותר לקריאה ולפרסום (Publish), שאותו מבצעת הודיה.

## איפה נמצא מה
- `hodayado1233-spec/hodigital-exact-clone` – הקוד של האתר החי ב-hodi-digital.co.il (TanStack Start, מסונכרן ל-Lovable). כאן עושים את השינויים.
- `hodayado1233-spec/hodigital` – גרסה ישנה של דף אחד ב-GitHub Pages. מוגדרת noindex בכוונה כדי לא ליצור תוכן כפול; לא להסיר את ה-noindex ולא להוסיף לה CNAME.

## הערות
- `/sitemap.xml` נבנית אוטומטית בשרת (`src/lib/sitemap.ts`). כוללים בה רק עמודים שניתן לאנדקס (לא דפי קטגוריות של הבלוג, לא `/thank-you/`).
- לא לשכתב היסטוריה שכבר נדחפה (force push / rebase / amend) – זה שובר את הסנכרון עם Lovable.

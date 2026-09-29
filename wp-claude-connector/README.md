# HoDigital Claude Connector (WordPress → MCP)

תוסף וורדפרס שהופך את האתר לשרת MCP, כך ש-Claude יכול לנהל אותו ישירות (גם מהמובייל) בלי כניסה ל-wp-admin ובלי Application Password.

## התקנה (פעם אחת לכל אתר)

1. מורידים את `hodigital-claude-connector.zip`.
2. בוורדפרס: **תוספים ← הוספת תוסף ← העלאת תוסף** ← בוחרים את ה-ZIP ← התקנה ← הפעלה.
   (אפשר גם להעלות את התיקייה ל-`wp-content/plugins` דרך מנהל הקבצים של האחסון.)
3. **הגדרות ← Claude Connector** ← מעתיקים את ה-Connector URL.
4. ב-Claude: **Settings ← Connectors ← Add custom connector** ← שם (למשל "אתר שני") ← מדביקים את ה-URL ← Add.

זהו. מעכשיו בכל צ'אט (גם באפליקציה בנייד) אפשר לכתוב "באתר של שני תעדכני את מספר הטלפון בכל העמודים".

## מה Claude יכול לעשות

| כלי | מה עושה |
| --- | --- |
| `get_site_info` | פרטי אתר, תבנית, תוספים פעילים, תוסף SEO |
| `list_content` / `get_content` | חיפוש וקריאה של פוסטים, עמודים ו-CPT (כולל לפי URL) |
| `create_content` / `update_content` / `delete_content` | יצירה, עריכה ומחיקה (לפח) |
| `search_replace_text` | החלפת טקסט בכל האתר (ברירת מחדל: הרצת ניסיון) |
| `get_post_meta` / `update_post_meta` | שדות מטא, כולל Yoast / Rank Math (כותרת ותיאור SEO) |
| `list_media` / `upload_media_from_url` / `update_media` | מדיה, alt, תמונה ראשית |
| `list_terms` / `list_menus` / `add_menu_item` | קטגוריות, תגיות ותפריטים |
| `update_site_settings` | שם האתר ותיאור |

## אבטחה

- ה-URL מכיל מפתח סודי אקראי באורך 48 תווים. **מי שמחזיק ב-URL יכול לערוך את האתר**, אז שומרים עליו כמו על סיסמה.
- Claude פועל בשם המנהל שנבחר בעמוד ההגדרות.
- ביטול גישה: "Regenerate key" בעמוד ההגדרות (ה-URL הישן מפסיק לעבוד), או השבתת התוסף.

## מגבלות

- בעמודים שנבנו ב-**Elementor** העיצוב שמור ב-`_elementor_data` ולא בתוכן הרגיל. `get_content` מחזיר `is_elementor: true`, ועריכת טקסט רגילה לא תשפיע עליהם.
- תוספי אבטחה שחוסמים את ה-REST API (למשל Disable REST API, או הגדרות מסוימות ב-Wordfence / iThemes) צריכים להחריג את הנתיב `hodigital-claude/v1`.
- אם הקישור הראשון לא עובד, משתמשים בקישור השני (`?rest_route=`) שמופיע בעמוד ההגדרות.

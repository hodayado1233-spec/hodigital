CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  gsc_property TEXT,
  gsc_error TEXT,
  backfilled INTEGER NOT NULL DEFAULT 0,
  fetched_on TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  fail_date TEXT,
  fail_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (client_id, keyword)
);

CREATE TABLE IF NOT EXISTS rankings (
  keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  position REAL,
  url TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (keyword_id, date)
);

-- דוח הבדיקה היומית ש-Claude כותב (מוצג בדשבורד)
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('ok', 'warn', 'error')),
  summary TEXT NOT NULL
);

-- המיקום המדויק בגוגל ישראל, נבדק כל בוקר דרך Serper (position ריק = לא נמצא עד מקום 50)
CREATE TABLE IF NOT EXISTS serp (
  keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  position INTEGER,
  url TEXT,
  PRIMARY KEY (keyword_id, date)
);

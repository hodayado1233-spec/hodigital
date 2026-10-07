CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
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
  position INTEGER,
  url TEXT,
  PRIMARY KEY (keyword_id, date)
);

DROP TABLE IF EXISTS "BasicInfo";

CREATE TABLE "BasicInfo" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page VARCHAR(255) UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image TEXT,
  vision TEXT,
  mission TEXT,
  strategic_goals TEXT,
  values TEXT,
  org_structure TEXT,
  work_fields TEXT
); 
CREATE DATABASE dollarsandlife;
CREATE USER seanpaul14 WITH PASSWORD 'Ismail1407.';
GRANT ALL PRIVILEGES ON DATABASE dollarsandlife TO seanpaul14;


DO $$ 
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'dollarsandlife') THEN
      CREATE DATABASE dollarsandlife;
   END IF;
END
$$;

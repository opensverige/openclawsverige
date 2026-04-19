-- Long-form editorial prose for the project detail page.
-- Optional; if null, the detail page falls back to description only.
alter table projects add column if not exists body text;

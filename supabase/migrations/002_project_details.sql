-- Project detail enrichments.
-- tagline: one-sentence quote from the builder.
-- tech_stack: list of technologies used ("Next.js", "Supabase", ...).
-- hero_image_url: large hero image for the detail page (screenshot_url stays as gallery thumbnail).
alter table projects add column if not exists tagline text;
alter table projects add column if not exists tech_stack text[] not null default '{}';
alter table projects add column if not exists hero_image_url text;

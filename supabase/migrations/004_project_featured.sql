-- Editorial curation: hand-picked projects shown as "Utvalt" above the grid.
-- `featured` flags the project; `featured_order` lets admin pin a sequence (nulls last).
alter table projects add column if not exists featured boolean not null default false;
alter table projects add column if not exists featured_order int;
create index if not exists projects_featured_idx on projects(featured, featured_order) where status = 'published';

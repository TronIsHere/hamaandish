-- Requires PostgreSQL 13+ for gen_random_uuid(), or enable pgcrypto on older versions.
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  name varchar(255) not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists users_lower_email_idx on users (lower(email));

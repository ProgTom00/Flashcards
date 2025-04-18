-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create generations table
create table generations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash text not null,
    source_text_length integer not null check(source_text_length between 1000 and 15000),
    duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create index
create index generations_user_id_idx on generations(user_id);

-- Create trigger for updated_at
create trigger set_timestamp_generations
    before update on generations
    for each row
    execute function update_updated_at_column(); 
-- Create generation_logs table
create table generation_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash text not null,
    source_text_length integer not null check(source_text_length between 1000 and 15000),
    error_code varchar not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create index
create index generation_logs_user_id_idx on generation_logs(user_id); 
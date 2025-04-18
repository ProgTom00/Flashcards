-- Create flashcards table
create table flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front varchar(200) not null check (char_length(front) <= 200),
    back varchar(500) not null check (char_length(back) <= 500),
    source varchar(10) not null check (source in ('ai-full', 'ai-edited', 'manual')),
    generation_id uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Add foreign key constraint for generation_id
alter table flashcards
add constraint flashcards_generation_id_fkey
foreign key (generation_id) references generations(id) on delete set null;

-- Create indexes
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);

-- Create trigger for updated_at
create trigger set_timestamp_flashcards
    before update on flashcards
    for each row
    execute function update_updated_at_column(); 
-- Enable Row Level Security
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_logs enable row level security;

-- Create RLS policies for flashcards
create policy "Users can view their own flashcards"
    on flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own flashcards"
    on flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS policies for generations
create policy "Users can view their own generations"
    on generations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own generations"
    on generations for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on generations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
    on generations for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS policies for generation_logs
create policy "Users can view their own generation logs"
    on generation_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own generation logs"
    on generation_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- No update/delete policies for generation_logs as they should be immutable 
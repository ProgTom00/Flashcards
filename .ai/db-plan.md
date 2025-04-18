# Schemat bazy danych PostgreSQL

## Tabele

### 1. users

This table is managed by Supabase Auth.

- **id**: UUID PRIMARY KEY
- **email**: VARCHAR NOT NULL UNIQUE
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **encrypted_password**: TEXT NOT NULL
- **confirmed_at**: TIMESTAMPTZ
- **activation_status**: BOOLEAN NOT NULL DEFAULT false  -- updated when confirmed_at is set

### 2. flashcards
- **id**: UUID PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **front**: VARCHAR(200) NOT NULL
  - CHECK (char_length(front) <= 200)
- **back**: VARCHAR(500) NOT NULL
  - CHECK (char_length(back) <= 500)
- **source**: VARCHAR(10) NOT NULL
  - CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- **generation_id**: UUID NULL REFERENCES generations(id) ON DELETE SET NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()  -- should be updated on modification

### 3. generations
- **id**: UUID PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **model**: VARCHAR NOT NULL
- **generated_count**: INTEGER NOT NULL
- **accepted_unedited_count**: INTEGER NULLABLE
- **accepted_edited_count**: INTEGER NULLABLE
- **source_text_hash**: TEXT NOT NULL
- **source_text_length**: INTEGER NOT NULL CHECK(source_text_length BETWEEN 1000 AND 15000)
- **duration**: Integer NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()  -- should be updated on modification

### 4. generation_logs
- **id**: UUID PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **model**: VARCHAR NOT NULL
- **source_text_hash**: TEXT NOT NULL
- **source_text_length**: INTEGER NOT NULL CHECK(source_text_length BETWEEN 1000 AND 15000)
- **error_code**: VARCHAR NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

## Relacje między tabelami
- W tabeli `flashcards`, `user_id` odnosi się do `users(id)`.
- W tabeli `flashcards`, `generation_id` odnosi się do `generations(id)` i jest opcjonalne.
- W tabeli `generations`, `user_id` odnosi się do `users(id)`.
- W tabeli `generation_logs`, `user_id` odnosi się do `users(id)`.

## Indeksy
- Unikalny indeks na kolumnie `email` w tabeli `users`.
- Pojedyncze indeksy na kolumnie `user_id` w tabelach:
  - `flashcards`
  - `generations`
  - `generation_logs`
- Dodatkowy pojedynczy indeks na kolumnie `generation_id` w tabeli `flashcards`.

## Zasady PostgreSQL (RLS)
Dla tabel posiadających kolumnę `user_id` wdrożymy mechanizm Row Level Security, aby użytkownik miał dostęp wyłącznie do swoich danych. Przykładowa polityka dla tabeli `flashcards`:

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_flashcards_policy ON flashcards
  USING (user_id = auth.uid());
```

Analogiczne zasady należy wdrożyć dla tabel `generations` oraz `generation_logs`.

## Dodatkowe uwagi
- Ograniczenia długości tekstu dla kolumn `front`, `back` oraz `source_text_length` są egzekwowane za pomocą CHECK constraints, uzupełniane logiką aplikacji.
- Kolumna `source` w tabeli `flashcards` przyjmuje wyłącznie wartości: 'ai-full', 'ai-edited', 'manual'.
- Schemat jest zaprojektowany z myślą o skalowalności i bezpieczeństwie, wykorzystując mechanizmy Supabase Auth oraz RLS.

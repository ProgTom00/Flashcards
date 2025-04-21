# API Endpoint Implementation Plan: Flashcard Generation (POST /api/generate)

## 1. Przegląd punktu końcowego
Endpoint służy do generowania sugestii flashcardów na podstawie dostarczonego tekstu. Wykorzystuje zewnętrzny serwis AI (Openrouter.ai) do wygenerowania propozycji, rejestruje sesję generacji w bazie danych (tabela generations) oraz odpowiednio zarządza błędami poprzez logowanie do tabeli generation_logs.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /api/generate
- **Parametry:**
  - **Wymagane:**
    - `text` (string) – tekst wejściowy o długości między 1000 a 15000 znaków
  - **Opcjonalne:** Brak
- **Request Body:**
  ```json
  {
    "text": "Twój tekst wejściowy..."
  }
  ```

## 3. Wykorzystywane typy
- **Command Model:** `GenerateFlashcardsCommand` (definiowany w types.ts), zawiera: { text: string }
- **DTO odpowiedzi:** `GenerateFlashcardsResponseDTO`, zawiera:
  - `generation_id`: string
  - `data`: Array of `FlashcardSuggestionDTO` (każdy obiekt zawiera: front, back, source – przy czym source jest ustalony na "ai-full")
  - `generated_count`: number

## 4. Szczegóły odpowiedzi
- **Sukces:**
  - Kod: 200 OK
  - Treść odpowiedzi:
    ```json
    {
      "generation_id": "uuid",
      "data": [
        { "front": "Pytanie...", "back": "Odpowiedź...", "source": "ai-full" },
        ...
      ],
      "generated_count": 5
    }
    ```
- **Błędy:**
  - 400 Bad Request – nieprawidłowe dane wejściowe (np. tekst pusty, zbyt krótki lub zbyt długi)
  - 401 Unauthorized – brak lub niewłaściwy token autoryzacyjny
  - 500 Internal Server Error – błędy wewnętrzne, np. awaria wywołania serwisu AI

## 5. Przepływ danych
1. Klient wysyła żądanie POST /api/generate z prawidłowym ciałem zawierającym pole `text`.
2. Middleware uwierzytelniający (oparty o Supabase Auth) weryfikuje token JWT oraz egzekwuje Row Level Security (RLS).
3. Endpoint waliduje długość tekstu zgodnie z wymaganiami (1000-15000 znaków).
4. Po pozytywnej weryfikacji wywoływany jest zewnętrzny serwis AI (Openrouter.ai) w celach generowania propozycji flashcardów.
5. W przypadku poprawnej odpowiedzi od serwisu AI, tworzony jest wpis w tabeli `generations` rejestrujący szczegóły sesji generacji.
6. Jeśli wywołanie zewnętrznego serwisu zawiedzie, zapisywany jest log błędu w tabeli `generation_logs` a serwer zwraca odpowiedź 500 Internal Server Error.
7. Endpoint zwraca odpowiedź zawierającą `generation_id`, listę wygenerowanych sugestii oraz `generated_count`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:**
  - Wykorzystanie tokenów JWT z Supabase Auth.
  - Egzekwowanie Row Level Security (RLS) w bazie danych, aby użytkownik miał dostęp tylko do swoich danych.
- **Walidacja:**
  - Sprawdzanie, czy pole `text` mieści się w wymaganym przedziale długości.
  - Upewnienie się, że format danych JSON jest prawidłowy.
- **Bezpieczeństwo danych:**
  - Użycie zapytań parametryzowanych w komunikacji z bazą danych, aby uniknąć SQL Injection.
  - Ograniczenie dostępu do logów generacji tylko dla autoryzowanych użytkowników (np. adminów).

## 7. Obsługa błędów
- **400 Bad Request:**
  - Zwracany, gdy pole `text` nie spełnia wymogów (np. zbyt krótki lub zbyt długi).
- **401 Unauthorized:**
  - Zwracany, gdy token nie jest dostarczony lub jest niewłaściwy.
- **500 Internal Server Error:**
  - Zwracany w przypadku błędu podczas wywołania serwisu AI lub problemów z bazą danych. W takich przypadkach rejestrowany jest log błędu w tabeli `generation_logs`.

## 8. Rozważania dotyczące wydajności
- **Asynchroniczność:**
  - Integracja z serwisem AI powinna być asynchroniczna, aby nie blokować głównego wątku serwera.
- **Optymalizacja zapytań:**
  - Upewnienie się, że zapytania do bazy danych wykorzystują odpowiednie indeksy (np. na kolumnach `user_id` i `generation_id`).
- **Cache'owanie:**
  - Rozważenie wdrożenia cache'owania, jeśli pojawi się duża liczba identycznych żądań.
- **Skalowalność:**
  - Monitorowanie obciążenia i ewentualne skalowanie instancji backendu w przypadku wzrostu liczby żądań.

## 9. Kroki implementacji
1. **Konfiguracja autoryzacji:**
   - Upewnić się, że middleware JWT oraz RLS są skonfigurowane w backendzie (Supabase Auth).
2. **Walidacja danych wejściowych:**
   - Implementacja walidacji danych za pomocą biblioteki Zod, w szczególności sprawdzenie, czy pole `text` ma długość między 1000 a 15000 znaków oraz czy JSON posiada prawidłowy format.
3. **Stworzenie serwisu generation.service:**
   - Implementacja serwisu odpowiedzialnego za: 
     - Integrację z zewnętrznym serwisem AI (Openrouter.ai) w celu generowania sugestii flashcardów.
     - Obsługę logiki zapisu sesji generacji do tabeli `generations`.
     - Rejestrację błędów w tabeli `generation_logs` w przypadku niepowodzenia wywołań zewnętrznych.
4. **Obsługa błędów i logowanie:**
   - Zaimplementowanie mechanizmu logowania błędów wewnątrz serwisu `generation.service`.
5. **Implementacja endpointu:**
   - Zaimplementowanie logiku endpointu wykorzystującej nowo utworzony serwis.
6. **Budowanie odpowiedzi:**
   - Formatowanie i zwracanie odpowiedzi zgodnie z `GenerateFlashcardsResponseDTO`.
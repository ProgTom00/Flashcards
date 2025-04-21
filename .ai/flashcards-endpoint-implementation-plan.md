# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia nowych fiszek (flashcards) w systemie. Użytkownik może przesłać jednocześnie wiele fiszek, zarówno ręcznie wprowadzonych (source: "manual") jak i generowanych przez AI (source: "ai-full" oraz "ai-edited"). Endpoint zapewnia walidację danych wejściowych, integrując się z bazą danych PostgreSQL zarządzaną przez Supabase oraz stosując mechanizmy RLS dla bezpieczeństwa.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: /api/flashcards
- **Parametry**:
  - **Wymagane**:
    - `front`: tekst fiszki (max 200 znaków)
    - `back`: tekst odpowiedzi (max 500 znaków)
    - `source`: wartość, która musi być jedną z: "manual", "ai-full", "ai-edited"
  - **Opcjonalne**:
    - `generation_id`: UUID lub null (szczególnie dla wpisów ręcznych)
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
         "front": "Co to jest AI?",
         "back": "Sztuczna inteligencja",
         "source": "manual",
         "generation_id": null
      },
      {
         "front": "Zdefiniuj ML",
         "back": "Uczenie maszynowe",
         "source": "ai-full",
         "generation_id": "081df36e-65e0-4232-b55e-75baff797a77"
      }
    ]
  }
  ```

## 3. Wykorzystywane typy
- **DTO dla odpowiedzi**:
  - `FlashcardDTO`: reprezentuje fiszkę zwróconą w odpowiedzi (id, front, back, source, created_at, generation_id)
- **Command modele**:
  - `CreateFlashcardDto`: model pojedynczego wpisu fiszki
  - `CreateFlashcards`: zawiera tablicę `flashcards` do zbiorowego tworzenia

## 4. Szczegóły odpowiedzi
- **201 Created**: Fiszki zostały pomyślnie utworzone.
  ```json
  {
     "data": [
        {
           "id": "uuid1",
           "front": "Co to jest AI?",
           "back": "Sztuczna inteligencja",
           "source": "manual",
           "created_at": "2023-10-10T12:34:56Z",
           "generation_id": null
        },
        {
           "id": "uuid2",
           "front": "Zdefiniuj ML",
           "back": "Uczenie maszynowe",
           "source": "ai-full",
           "created_at": "2023-10-10T12:35:00Z",
           "generation_id": "081df36e-65e0-4232-b55e-75baff797a77"
        }
     ]
  }
  ```
- **400 Bad Request**: Niewłaściwe dane wejściowe.
- **401 Unauthorized**: Użytkownik nie jest uwierzytelniony.
- **500 Internal Server Error**: Błąd po stronie serwera.

## 5. Przepływ danych
1. Odbiór i parsowanie JSON z żądania.
2. Walidacja danych wejściowych:
   - Sprawdzenie długości pól `front` (do 200 znaków) oraz `back` (do 500 znaków).
   - Weryfikacja, że `source` należy do dozwolonych wartości.
   - Warunkowe sprawdzenie pola `generation_id` (musi być `null` dla wpisów ręcznych).
3. Przekazanie zwalidowanych danych do warstwy serwisowej odpowiedzialnej za logikę biznesową.
4. Warstwa serwisowa wykonuje operację insercji danych do tabeli `flashcards` w bazie PostgreSQL, korzystając z mechanizmów Supabase oraz RLS.
5. Zwrócenie odpowiedzi zawierającej listę utworzonych fiszek.

## 6. Względy bezpieczeństwa
<!-- - **Uwierzytelnienie i autoryzacja**:
  - Endpoint wymaga, aby użytkownik był uwierzytelniony (Supabase Auth).
  - RLS (Row Level Security) gwarantuje, że użytkownik operuje tylko na swoich danych. -->
- **Weryfikacja danych**:
  - Sprawdzenie długości i typów pól wejściowych.
  - Walidacja wartości `source` zgodnie z ograniczeniami bazy danych.
- **Zapobieganie atakom**:
  - Użycie zapytań parametryzowanych zamiast interpolacji danych.
  - Odpowiednie logowanie oraz obsługa wyjątków.

## 7. Obsługa błędów
- **400 Bad Request**:
  - Wystąpi, gdy dane wejściowe nie spełniają walidacji (np. niepoprawne typy lub przekroczenie limitów długości).
- **401 Unauthorized**:
  - Brak lub nieprawidłowy token uwierzytelniający.
- **500 Internal Server Error**:
  - Błędy operacyjne w bazie danych lub inne niespodziewane wyjątki.
- Dodatkowo, logika rejestracji błędów może zapisywać informacje do tabeli `generation_logs` w przypadku operacji związanych z generacją fiszek.

## 8. Rozważania dotyczące wydajności
- **Bulk insert**:
  - Wykorzystanie operacji masowej insercji dla wielu fiszek jednocześnie dla zwiększenia wydajności.
- **Indeksowanie**:
  - Korzystanie z istniejących indeksów (np. na `user_id` i `generation_id`) w tabeli `flashcards`.
- **Skalowalność**:
  - Optymalizacja operacji walidacyjnych i insercyjnych przy dużej liczbie równoczesnych żądań.

## 9. Etapy wdrożenia
1. Utworzenie lub aktualizacja routingu dla endpointu `/api/flashcards`.
2. Implementacja walidacji danych wejściowych (np. przy użyciu Zod lub Yup) zgodnie z `CreateFlashcardDto` i `CreateFlashcards`.
3. Utworzenie warstwy serwisowej odpowiedzialnej za logikę biznesową i operacje na bazie danych:
   - Przetwarzanie masowych insercji.
   - Integracja z Supabase Auth w celu pozyskania `user_id`.
4. Implementacja mapowania wyjątków na odpowiednie kody statusu (400, 401, 500) oraz logiki rejestrowania błędów.
5. Wdrożenie najpierw na środowisku testowym, a następnie w produkcji. 
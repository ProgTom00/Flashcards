# Plan implementacji widoku Generate

## 1. Przegląd
Widok Generate umożliwia użytkownikowi wklejenie długiego tekstu, które następnie zostaje przetworzone przez model AI w celu wygenerowania propozycji fiszek. Użytkownik ma możliwość przeglądania, akceptacji, edycji lub odrzucenia każdej wygenerowanej fiszki, co upraszcza i przyspiesza proces tworzenia materiałów edukacyjnych.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/generate`.

## 3. Struktura komponentów
- **GenerateView** (główny komponent strony)
  - **TextAreaInput** (obsługuje wprowadzanie tekstu przez użytkownika)
  - **GenerateButton** (przycisk inicjujący wywołanie API)
  - **Loader** (wskaźnik ładowania podczas komunikacji z API)
  - **SuggestionsList** (lista wygenerowanych sugestii fiszek)
  - **FlashcardSuggestionCard** (pojedyncza karta fiszki z opcjami: akceptuj, edytuj, odrzuć)
  - **ToastNotifications** (komponent do wyświetlania komunikatów o sukcesie i błędach)
  - **BulkSaveButton** przyciski do zapisu fiszek lub tylko zaakceptowanych

## 4. Szczegóły komponentów
### GenerateView
- Opis: Główny komponent strony zarządzający stanem widoku, wywołaniem API oraz przekazywaniem danych do podkomponentów.
- Główne elementy: TextAreaInput, GenerateButton, Loader, SuggestionsList, ToastNotifications.
- Obsługiwane interakcje: Wprowadzanie tekstu, kliknięcie przycisku generowania, wybór akcji na fiszkach.
- Warunki walidacji: Sprawdzenie, czy wprowadzony tekst zawiera od 1000 do 15000 znaków przed wywołaniem API.
- Typy: Stan komponentu (inputText: string, loading: boolean, suggestions: FlashcardSuggestionDTO[], errorMessage: string).
- Propsy: Brak, komponent stronowy.

### TextAreaInput
- Opis: Komponent wejściowy przyjmujący tekst, który ma być użyty do generowania fiszek.
- Główne elementy: Pole tekstowe (textarea) z etykietą i placeholderem.
- Obsługiwane interakcje: onChange, onBlur.
- Warunki walidacji: Minimalnie 1000 znaków i maksymalnie 15000 znaków.
- Typy: Przekazuje wartość jako string.
- Propsy: value (string), onChange (callback), error (opcjonalny komunikat walidacyjny).

### GenerateButton
- Opis: Przycisk inicjujący wysyłkę żądania do API generującego fiszki.
- Główne elementy: Przycisk HTML z etykietą "Generuj fiszki".
- Obsługiwane interakcje: onClick; przycisk powinien być zablokowany (disabled) gdy stan loading jest aktywny lub walidacja tekstu nie została spełniona.
- Warunki walidacji: Upewnienie się, że wpisany tekst spełnia kryteria długościowe.
- Typy: Brak dodatkowych.
- Propsy: disabled (boolean), onClick (callback).

### SuggestionsList
- Opis: Komponent wyświetlający listę wygenerowanych sugestii fiszek.
- Główne elementy: Lista elementów FlashcardSuggestionCard.
- Obsługiwane interakcje: Przekazywanie callbacków do obsługi przycisków w kartach.
- Warunki walidacji: Dane wyświetlane zgodnie z odpowiedzią API, brak dodatkowej walidacji.
- Typy: suggestions: FlashcardSuggestionDTO[].
- Propsy: suggestions (array).

### FlashcardSuggestionCard
- Opis: Komponent reprezentujący pojedynczą fiszkę z wygenerowanej listy, z opcjami interakcji.
- Główne elementy: Wyświetlanie pól "front" i "back", przyciski akceptacji, edycji i odrzucenia.
- Obsługiwane interakcje: onAccept, onEdit, onReject (callbacki do modyfikacji listy sugestii).
- Warunki walidacji: Brak dodatkowej walidacji, opcjonalnie walidacja przy edycji.
- Typy: flashcard: FlashcardSuggestionDTO.
- Propsy: flashcard (FlashcardSuggestionDTO), onAccept (callback), onEdit (callback), onReject (callback).

### Loader
- Opis: Komponent wizualizujący stan ładowania podczas komunikacji z API.
- Główne elementy: Spinner lub animacja loading.
- Obsługiwane interakcje: Brak interakcji użytkownika.
- Warunki walidacji: Brak.
- Typy: Brak dodatkowych.
- Propsy: visible (boolean).

### ToastNotifications
- Opis: Komponent wyświetlający powiadomienia o sukcesie lub błędach operacyjnych.
- Główne elementy: Kontener na komunikat, opcjonalnie przycisk zamknięcia.
- Obsługiwane interakcje: Automatyczne lub manualne zamykanie powiadomień.
- Warunki walidacji: Brak.
- Typy: message (string), type: 'error' | 'success'.
- Propsy: message (string), type (string).

### BulkSaveButton
- Opis: Komponent umożliwiający masowy zapis fiszek. Użytkownik może zapisać wszystkie wygenerowane fiszki lub tylko te, które zostały zaakceptowane.
- Główne elementy: Przycisk HTML z etykietą dynamicznie zmieniającą się w zależności od kontekstu (np. "Zapisz wszystkie" lub "Zapisz zaakceptowane").
- Obsługiwane interakcje: onClick – wywołuje funkcję, która zbiera dane fiszek, waliduje je i wysyła do API.
- Warunki walidacji: Przycisk aktywny, gdy lista fiszek nie jest pusta oraz gdy przynajmniej jedna fiszka spełnia kryteria zapisu.
- Typy: Wykorzystuje typy CreateFlashcardDto oraz CreateFlashcards.
- Propsy: flashcards (CreateFlashcardDto[]), onBulkSave (callback do wywołania zapisu), loading (boolean) wskazujący proces zapisu.

## 5. Typy
- **FlashcardSuggestionDTO** (definiowany w `src/types.ts`):
  - front: string
  - back: string
  - source: "ai-full"
- **GenerateFlashcardsCommand**: 
  - text: string
- **GenerateFlashcardsResponseDTO**:
  - generation_id: string
  - data: FlashcardSuggestionDTO[]
  - generated_count: number
- **CreateFlashcardDto** (definiowany w `src/types.ts`):
  - front: string
  - back: string
  - source: "manual" | "ai-full" | "ai-edited"
  - generation_id?: string | null  // null dla ręcznych wpisów
- **CreateFlashcards** (definiowany w `src/types.ts`):
  - flashcards: CreateFlashcardDto[]
- Dodatkowe typy widoku mogą być zdefiniowane lokalnie w GenerateView (np. interfejs stanu widoku).

## 6. Zarządzanie stanem
- Użycie hooków React (useState, useEffect) do przechowywania:
  - inputText (string)
  - loading (boolean)
  - suggestions (FlashcardSuggestionDTO[])
  - errorMessage (string) – dla komunikatów walidacyjnych i błędów API
- Możliwość stworzenia customowego hooka `useGenerateFlashcards`, który zarządza wywołaniem API i aktualizacją stanu, lecz nie jest obowiązkowy.

## 7. Integracja API
- Endpoint do generowania fiszek:
  - POST `/api/generate`
  - Typ żądania: { text: string }
  - Odpowiedź: { generation_id: string, data: FlashcardSuggestionDTO[], generated_count: number }
  - Logika integracji: Po kliknięciu w GenerateButton, wysłanie żądania, ustawienie stanu loading oraz aktualizacja suggestions zgodnie z odpowiedzią. W przypadku błędu, wyświetlany jest komunikat przez ToastNotifications.

- Endpoint do zapisu fiszek (Bulk Save):
  - POST `/api/flashcards`
  - Typ żądania: CreateFlashcards (obiekt zawierający tablicę fiszek, gdzie każda fiszka jest typu CreateFlashcardDto)
  - Odpowiedź: Zwraca zapisane fiszki (np. FlashcardDTO) wraz z metadanymi (created_at, id itd.)
  - Logika integracji: Po kliknięciu BulkSaveButton, funkcja zbiera odpowiednie dane fiszek, waliduje je, a następnie wysyła żądanie do API. W przypadku sukcesu, wyświetlany jest pozytywny komunikat; w przypadku błędu, ToastNotifications informuje o problemie.

## 8. Interakcje użytkownika
- Użytkownik wprowadza tekst w polu TextAreaInput.
- Po kliknięciu przycisku GenerateButton widok wyświetla Loader i wykonuje wywołanie API.
- Po otrzymaniu odpowiedzi, SuggestionsList prezentuje wygenerowane fiszki.
- Użytkownik może:
  - Akceptować fiszkę (dodając ją do zbioru do zapisu).
  - Edytować fiszkę (modyfikować treść przed zatwierdzeniem).
  - Odrzucić fiszkę (usuwać ją z listy propozycji).
- Użytkownik korzysta z BulkSaveButton, aby zapisać masowo wybrane fiszki.
- Pojawia się komunikat (ToastNotifications) informujący o sukcesie lub wystąpieniu błędu.

## 9. Warunki i walidacja
- Tekst wprowadzany przez użytkownika musi mieć od 1000 do 15000 znaków.
- GenerateButton pozostaje nieaktywny, o ile tekst nie spełnia warunków lub gdy trwa wywołanie API.
- Walidacja odpowiedzi API odbywa się poprzez sprawdzenie statusu odpowiedzi i struktury danych zgodnie z GenerateFlashcardsResponseDTO.

## 10. Obsługa błędów
- W przypadku nieprawidłowego tekstu – wyświetlenie komunikatu walidacyjnego obok pola TextAreaInput.
- W razie błędów API (kod 400, 500) – ToastNotifications prezentuje odpowiedni komunikat, a stan loading jest resetowany.
- Dodatkowo: obsługa błędów sieciowych i timeoutów poprzez wyświetlenie komunikatu o problemie.

## 11. Kroki implementacji
1. Utworzenie nowego widoku GenerateView w folderze stron, dostępnego pod ścieżką `/generate`.
2. Stworzenie komponentów: TextAreaInput, GenerateButton, Loader, SuggestionsList, FlashcardSuggestionCard, ToastNotifications, BulkSaveButton.
3. Implementacja walidacji pola tekstowego w komponencie TextAreaInput.
4. Implementacja funkcji wywołującej API POST `/api/generate` (bezpośrednio w GenerateView lub jako customowy hook `useGenerateFlashcards`).
5. Zarządzanie stanem widoku przy użyciu hooków React (useState, useEffect).
6. Integracja API w GenerateView z odpowiednią obsługą stanu loading i błędów.
7. Implementacja interakcji w SuggestionsList – obsługa akceptacji, edycji i odrzucenia fiszek poprzez odpowiednie callbacki.
8. Implementacja funkcjonalności BulkSaveButton wywołującego API POST `/api/flashcards` z danymi zgodnymi z typem CreateFlashcards.
9. Testowanie widoku pod kątem poprawności walidacji, obsługi błędów i renderowania danych.
10. Refaktoryzacja oraz integracja widoku z globalnym systemem routingu aplikacji. 
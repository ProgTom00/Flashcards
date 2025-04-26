# Plan testów dla projektu Flashcards

## 1. Wprowadzenie i cele testowania
Celem planu testów jest zapewnienie najwyższej jakości produktu poprzez kompleksowe sprawdzenie funkcjonalności, wydajności, bezpieczeństwa oraz kompatybilności aplikacji. Testowanie ma na celu:
- Weryfikację poprawności działania głównych komponentów systemu.
- Wykrycie potencjalnych błędów i luk przed wdrożeniem na produkcję.
- Zapewnienie spójności interakcji pomiędzy frontendem (Astro, React, TypeScript, Tailwind, Shadcn/ui) a backendem (Supabase oraz integracją z API Openrouter.ai).
- Potwierdzenie zgodności z wymaganiami biznesowymi i technicznymi.

## 2. Zakres testów
Zakres testów obejmuje:
- **Frontend**: testy jednostkowe i integracyjne komponentów React i Astro, weryfikację renderowania, testy wizualne oraz testy interaktywności (symulacja zdarzeń użytkownika).
- **Backend**: testy poprawności działania zapytań do bazy danych (PostgreSQL), autentykacji użytkowników oraz operacji wykonywanych przez Supabase.
- **Integracja AI**: testy poprawnej komunikacji z usługą Openrouter.ai, obsługa błędów oraz limity API.
- **CI/CD**: weryfikacja pipeline'ów CI/CD (GitHub Actions) oraz poprawności budowania i wdrażania aplikacji.
- **Wydajność i bezpieczeństwo**: testy wydajnościowe, testy związane z bezpieczeństwem oraz testy kompatybilności cross-browser.

## 3. Typy testów do przeprowadzenia
- **Testy jednostkowe**  
  - Sprawdzają pojedyncze funkcjonalności i logikę komponentów w izolacji.
  - Narzędzia: Jest, React Testing Library, Vitest, @astro/testing dla komponentów Astro.

- **Testy integracyjne**  
  - Weryfikują współdziałanie komponentów frontendu (np. interakcja między Astro a React).
  - Testy przepływu danych pomiędzy frontendem a backendem (Supabase i API Openrouter.ai).
  - Narzędzia: MSW (Mock Service Worker) do mockowania API.

- **Testy end-to-end (E2E)**  
  - Symulują pełne scenariusze użytkownika, od logowania, poprzez wykonywanie głównych akcji w aplikacji, aż po wylogowanie.
  - Narzędzia: Playwright (jako główne narzędzie) lub Cypress, zapewniające lepszą wydajność i wsparcie dla wszystkich głównych przeglądarek.

- **Testy wydajnościowe**  
  - Ocena szybkości działania aplikacji oraz czasu reakcji interfejsu.
  - Testowanie pod obciążeniem krytycznych funkcjonalności.
  - Narzędzia: Lighthouse, k6, WebPageTest, Sitespeed.io do monitorowania metryk wydajności.

- **Testy bezpieczeństwa**  
  - Weryfikacja mechanizmów autoryzacji i uwierzytelniania.
  - Identyfikacja potencjalnych podatności.
  - Narzędzia: OWASP ZAP, Snyk (do analizy podatności zależności), SonarQube (analiza statyczna kodu).

- **Testy kompatybilności**
  - Weryfikacja działania aplikacji na różnych przeglądarkach i urządzeniach.
  - Narzędzia: BrowserStack lub LambdaTest.

## 4. Scenariusze testowe dla kluczowych funkcjonalności
- **Rejestracja i logowanie użytkownika**
  - Testy poprawności formularzy, walidacji danych i obsługi błędów.
  - Weryfikacja autentykacji oraz autoryzacji przy użyciu Supabase.

- **Interakcja z komponentami flashcards**
  - Testy wyświetlania pytań/odpowiedzi.
  - Sprawdzenie logiki przełączania między stanami flashcard (np. odsłanianie odpowiedzi).

- **Integracja z API AI**
  - Testy wysyłania oraz odbierania danych z Openrouter.ai.
  - Sprawdzenie limitów finansowych i obsługi błędów związanych z przekroczeniem limitów.
  - Testy property-based (np. fast-check) dla weryfikacji różnorodnych odpowiedzi AI.

- **Działanie interfejsu użytkownika**
  - Testy renderowania elementów UI, zgodność z Tailwind CSS oraz biblioteką Shadcn/ui.
  - Testy responsywności, dostępności oraz kompatybilności przeglądarkowej.

- **Przepływy transakcyjne i nawigacja**
  - Weryfikacja poprawności działania ścieżek nawigacyjnych między stronami.
  - Testy scenariuszy niższego i wyższego priorytetu w aplikacji.

## 5. Środowisko testowe
- **Lokalne**: środowisko deweloperskie z wykorzystaniem kontenerów Docker (jeśli dotyczy) lub lokalnych instancji Supabase.
- **Staging**: środowisko zbliżone do produkcyjnego, umożliwiające pełne testowanie integracyjne i E2E.
- **Dane testowe**: symulowane dane w bazie danych PostgreSQL zapewniane przez Supabase (z możliwością użycia Testcontainers) oraz mocki dla API AI.

## 6. Narzędzia do testowania
- **Frameworki testowe**: Jest, React Testing Library, Vitest, Playwright, @astro/testing.
- **Narzędzia CI/CD**: GitHub Actions do automatycznego uruchamiania testów.
- **Narzędzia do testów API**: Postman/Newman dla testowania API Supabase, MSW do mockowania integracji.
- **Narzędzia do testów wydajnościowych**: Lighthouse, k6, WebPageTest, Sitespeed.io.
- **Narzędzia do testów bezpieczeństwa**: OWASP ZAP, Snyk, SonarQube.
- **Narzędzia do testów kompatybilności**: BrowserStack lub LambdaTest.
- **Raportowanie i monitoring**: Allure Report, DataDog lub New Relic.

## 7. Harmonogram testów
- **Faza przygotowawcza (1 tydzień)**: konfiguracja środowiska testowego, przygotowanie danych testowych oraz narzędzi.
- **Testy jednostkowe (2-3 tygodnie)**: pisanie i uruchamianie testów jednostkowych, weryfikacja pokrycia kodu.
- **Testy integracyjne i E2E (3-4 tygodnie)**: budowanie scenariuszy oraz symulacja pełnych przepływów użytkownika.
- **Testy wydajnościowe i bezpieczeństwa (1-2 tygodnie)**: uruchomienie testów pod obciążeniem oraz audytu bezpieczeństwa.
- **Testy kompatybilności (1 tydzień)**: weryfikacja działania aplikacji na różnych przeglądarkach i urządzeniach.
- **Podsumowanie i raportowanie (1 tydzień)**: analiza wyników, dokumentacja błędów oraz przygotowanie rekomendacji przed wdrożeniem.

## 8. Kryteria akceptacji testów
- Osiągnięcie ustalonego poziomu pokrycia kodu testami (np. minimum 80%).
- Brak krytycznych błędów blokujących działanie aplikacji.
- Poprawne działanie kluczowych przepływów funkcjonalnych (rejestracja, logowanie, obsługa flashcards, integracja z API AI).
- Pozytywna weryfikacja wyników testów wydajnościowych i bezpieczeństwa.
- Potwierdzenie kompatybilności z kluczowymi przeglądarkami i urządzeniami.

## 9. Role i odpowiedzialności
- **Inżynier QA**: przygotowanie scenariuszy testowych, definiowanie kryteriów akceptacji, prowadzenie testów manualnych i automatycznych.
- **Programiści**: wdrożenie testów jednostkowych oraz integracyjnych, szybkie reagowanie na uwagi z testów.
- **Test Lead**: koordynacja harmonogramu testów, przegląd wyników testów, komunikacja między zespołami.
- **DevOps/Specjalista CI/CD**: utrzymanie i nadzorowanie pipeline'ów testowych oraz wdrożeń.
- **Specjalista bezpieczeństwa**: przeprowadzanie audytów bezpieczeństwa i analiza wyników.

## 10. Procedury raportowania błędów
- **Rejestracja błędów**: wszystkie znalezione błędy będą zgłaszane w systemie zarządzania defektami (np. GitHub Issues, Jira).
- **Kategoryzacja błędów**: błędy będą klasyfikowane według krytyczności (krytyczne, wysokie, średnie, niskie) oraz przypisywane do odpowiednich zespołów.
- **Proces weryfikacji**: każdy zgłoszony błąd zostanie zweryfikowany na podstawie scenariuszy testowych oraz powtórnie przetestowany po poprawkach.
- **Raportowanie wyników**: użycie Allure Report do generowania przejrzystych raportów z wynikami testów.
- **Komunikacja**: regularne spotkania podsumowujące wyniki testów, raportowanie postępów oraz przegląd statusu błędów.

---
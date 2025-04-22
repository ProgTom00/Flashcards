# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Interfejs użytkownika dzieli się na dwie główne strefy:

- **Strefa publiczna:** Łączy ekran logowania oraz rejestracji, umożliwiając użytkownikom dostęp do aplikacji.
- **Strefa prywatna (Dashboard):** Centralny hub nawigacyjny, w którym użytkownik ma dostęp do:
  - Generowania fiszek przy użyciu tekstu wejściowego
  - Przeglądu, edycji (poprzez modal) oraz usuwania fiszek
  - Panelu użytkownika z informacjami o profilu i opcjami konfiguracji

Responsywność interfejsu jest osiągana dzięki zastosowaniu Tailwind CSS z utility variants (sm:, md:, lg:), co zapewnia spójne doświadczenie na różnych urządzeniach. Zarządzanie stanem i buforowaniem danych realizowane jest przy użyciu React Query, z możliwością rozbudowy oraz przyszłego wdrożenia autoryzacji opartej na Bearer JWT.

## 2. Lista widoków

1. **Ekran uwierzytelniania(Logowanie/Rejestracja)**
   - **Ścieżka widoku:** `/login' i '/register` 
   - **Główny cel:** Umożliwienie nowym oraz istniejącym użytkownikom logowania i rejestracji.
   - **Kluczowe informacje do wyświetlenia:** Formularze logowania i rejestracji z polami e-mail i hasło, komunikaty błędów inline, powiadomienia sukcesu jako toasty. 
   - **Kluczowe komponenty widoku:** Formularz, przyciski przesyłania, komponent inline do walidacji błędów oraz system toastów.
   - **UX / Dostępność / Bezpieczeństwo:** Prosty formularz wraz z walidacją, czytelne komunikaty błędów zachowanie minimalnych danych osobowych.

2. **Dashboard (Strefa prywatna)**
   - **Ścieżka widoku:** `/dashboard`
   - **Główny cel:** Centralny punkt nawigacyjny, który integruje wszystkie główne funkcjonalności aplikacji.
   - **Kluczowe informacje do wyświetlenia:** Pasek nawigacyjny (TopBar) z linkami do poszczególnych sekcji, ogólny przegląd aktywności, powiadomienia systemowe.
   - **Kluczowe komponenty widoku:** TopBar, komponenty nawigacyjne (np. Sidebar lub menu górne), sekcje podzielone na karty lub panele.
   - **UX / Dostępność / Bezpieczeństwo:** Intuicyjna nawigacja, wsparcie dla klawiatury, responsywny design, zabezpieczenie widoku prywatnego.

3. **Widok generowania fiszek**
   - **Ścieżka widoku:** `/generate`
   - **Główny cel:** Umożliwia użytkownikowi wklejenia długiego tekstu  oraz generowanie propozycji fiszek przez AI i ich rewizję (zaakceptuj, edytuj lub odrzuć).
   - **Kluczowe informacje do wyświetlenia:** Pole tekstowe do wprowadzania tekstu (1000-15000 znaków), przycisk generowania, informacje o statusie (ładowanie, powodzenie, błąd). 
   - **Kluczowe komponenty widoku:** Textarea, przycisk akcji, wskaźnik ładowania, komunikaty inline dla błędów oraz system toastów dla sukcesu(zapisz wszystkie, zapisz zaakceptowane).
   - **UX / Dostępność / Bezpieczeństwo:** Intuicyjny formular wraz z dużym poleem tekstowem z odpowiednią walidacją, wsparcie ARIA dla komunikatów statusowych, zabezpieczenie przed wielokrotnym wysyłaniem żądań.

4. **Widok listy fiszek**
   - **Ścieżka widoku:** `/flashcards`
   - **Główny cel:** Prezentacja listy wszystkich dostępnych fiszek użytkownika, umożliwiając ich sortowanie, edycję oraz usuwanie.
   - **Kluczowe informacje do wyświetlenia:** Lista fiszek z podziałem na kolumny (np. przód, tył, źródło), dropdown do sortowania (DESC, ASC, alfabetycznie), komunikaty statusowe.
   - **Kluczowe komponenty widoku:** Komponent listy/tabeli, dropdown sortowania, przyciski akcji (edytuj, usuń).
   - **UX / Dostępność / Bezpieczeństwo:** Przejrzystość listy, możliwość filtrowania oraz sortowania, dostępność klawiatury, potwierdzenie operacji usuwania.

5. **Modal edycji fiszek**
   - **Ścieżka widoku:** `Wyświetlany nad widokiem listy fiszek`
   - **Główny cel:** Umożliwienie edycji fiszek z walidacją danych bez zapisu w czasie rzeczywistym.
   - **Kluczowe informacje do wyświetlenia:** Formularz edycji fiszki, pola "Przód" oraz "Tył", komunikaty walidacyjne.
   - **Kluczowe komponenty widoku:** Modal z formularzem, przyciski "Zapisz" i "Anuluj"
   - **UX / Dostępność / Bezpieczeństwo:** Intuicyjny modal, dostępność dla czytników ekranu, walidacja danych po stronie klienta przed wysłaniem zmian.

6. **Panel użytkownika**
   - **Ścieżka widoku:** `/profile`
   - **Główny cel:** Prezentacja informacji o użytkowniku, zarządzanie profilem oraz opcje wylogowania.
   - **Kluczowe informacje do wyświetlenia:** Dane profilu, ustawienia konta, historia aktywności.
   - **Kluczowe komponenty widoku:** Formularze edycji danych, przyciski akcji (aktualizuj, wyloguj), elementy nawigacyjne.
   - **UX / Dostępność / Bezpieczeństwo:** Ochrona danych osobowych, możliwość edycji danych w bezpiecznym formularzu, intuicyjny dostęp do opcji konta.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na **ekran publiczny** i dokonuje rejestracji lub logowania przy użyciu domyślnego mechanizmu.
2. Po pomyślnym logowaniu użytkownik zostaje przekierowany na **Dashboard**.
3. W ramach Dashboardu użytkownik ma możliwość:
   - Przejścia do widoku **Generowania fiszek**, gdzie wkleja tekst i wywołuje API do generowania propozycji fiszek.
   - Przejścia do widoku **Listy fiszek**, gdzie może przeglądać, sortować, edytować (przez modal) lub usuwać istniejące fiszki.
   - Przejścia do widoku **Modal edycji fiszek**, gdzie użytkownik ma modal z formularzem z przyciskami "Zapisz" i "Anuluj".
   - Wejścia do **Panelu użytkownika**, gdzie może modyfikować dane konta i zarządzać profilem.
4. W przypadku błędów (np. walidacji, problemów z API) użytkownik otrzymuje komunikaty inline.

## 4. Układ i struktura nawigacji

- **Strefa publiczna:** Prosty interfejs z jednym głównym formularzem logowania/rejestracji.
- **Strefa prywatna:** Nawigacja realizowana jest przez TopBar, który zawiera linki do:
  - Generowania fiszek
  - Listy fiszek
  - Panelu użytkownika

Dodatkowo, w widoku listy fiszek dostępny jest komponent dropdown umożliwiający sortowanie według różnych kryteriów (DESC, ASC, alfabetycznie). Nawigacja umożliwia łatwe przełączanie między widokami, a zachowanie spójności osiągane jest dzięki zastosowaniu Tailwind CSS.

## 5. Kluczowe komponenty

- **TopBar:** Główny element nawigacyjny dla strefy prywatnej, umożliwiający szybki dostęp do wszystkich głównych widoków oraz opcji konta.
- **Formularze logowania/rejestracji:** Kluczowe dla ekranu publicznego, zawierające walidację inline i integrację z systemem komunikatów (toasty oraz błędy inline).
- **Dropdown sortowania:** Ułatwia sortowanie listy fiszek według różnych kryteriów.
- **Modal edycji:** Umożliwia szybkie edytowanie fiszek bez konieczności przechodzenia na inny widok.
- **Komponent listy/tabeli:** Do prezentacji fiszek, zapewniający przejrzysty układ i wsparcie dla responsywności.
- **System toastów i komunikatów inline:** Informują użytkownika o sukcesie operacji lub wystąpieniu błędów.
- **React Query:** Zarządza buforowaniem danych i efektywną komunikacją z API, zapewniając spójność danych pomiędzy widokami.
- **Tailwind CSS:** Zapewnia responsywność i spójny, nowoczesny design interfejsu, wspierając przy tym dostępność (accessibility) aplikacji. 
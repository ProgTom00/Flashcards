# Specyfikacja modułu autentykacji dla 10x-cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura stron i layoutów
- Utworzymy odrębne strony w Astro dla: 
  - Rejestracji (US-001)
  - Logowania (US-002)
  - Odzyskiwania hasła (US-003)

- Zaprojektujemy dwa główne layouty:
  - **LayoutPublic** – dla stron dostępnych przed autentykacją (rejestracja, logowanie, odzyskiwanie hasła).
  - **LayoutApp** – dla stron wymagających autentykacji, zawierający nawigację, pasek profilu oraz przycisk wylogowania (umieszczony w prawym górnym rogu) oraz inne elementy charakterystyczne dla użytkownika zalogowanego.

### 1.2 Komponenty i ich odpowiedzialności
- **FormularzRejestracji**:
  - Komponent React obsługujący rejestrację (US-001) z polami: e-mail, hasło oraz potwierdzenie hasła.
  - Walidacja: sprawdzanie formatu e-maila, minimum długości hasła oraz zgodności haseł.
  - Komunikaty błędów wyświetlane bezpośrednio przy polach formularza (np. „Niepoprawny format e-mail”, „Hasła nie są zgodne”).

- **FormularzLogowania**:
  - Komponent React odpowiedzialny za logowanie (US-002) z polami: e-mail i hasło.
  - Walidacja: sprawdzenie poprawności danych wejściowych i komunikacja z backendem przez Supabase Auth. W przypadku błędnych danych użytkownik otrzymuje stosowny komunikat np. „Nieprawidłowe dane logowania”.

- **FormularzOdzyskiwaniaHasła**:
  - Komponent pozwalający użytkownikowi na wysłanie żądania odzyskania hasła (US-003).
  - Użytkownik ma możliwość uzyskania dostępu do formularza odzyskiwania hasła poprzez link umieszczony na stronie logowania (np. "Zapomniałeś hasła?").
  - Podanie adresu e-mail skutkuje wysłaniem linku resetującego, zgodnie z mechanizmem oferowanym przez Supabase.

### 1.3 Integracja z backendem
- Strony Astro renderują komponenty React. Działania takie jak nawigacja, przesyłanie formularzy i zarządzanie stanem autentykacji odbywają się przez dedykowane API endpoints.
- Użycie React Context lub hooków do zarządzania stanem autentykacji, umożliwiających utrzymanie spójności między klientem a serwerem.

### 1.4 Obsługa walidacji i błędów
- **Po stronie klienta**:
  - Walidacja lokalna przy pomocy bibliotek (np. Yup) dla wstępnego sprawdzenia danych.
  - Dynamiczne komunikaty błędów przy nieprawidłowym wypełnieniu formularzy.

- **Po stronie serwera**:
  - Weryfikacja danych wejściowych na backendzie przed przetwarzaniem (np. tworzeniem nowych kont).
  - Standardowe kody odpowiedzi HTTP 400/401/500 w przypadku błędów.

### 1.5 Scenariusze użytkowania
- Rejestracja: nowy użytkownik wypełnia formularz rejestracyjny i po pozytywnej walidacji konto zostaje utworzone oraz użytkownik logowany automatycznie.
- Logowanie: użytkownik wprowadza dane, a w przypadku poprawnych danych następuje przekierowanie do interfejsu aplikacji.
- Odzyskiwanie hasła: użytkownik żąda resetu hasła, otrzymuje link resetujący na e-mail, a następnie ustawia nowe hasło.

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API
- **POST /api/auth/register**
  - Rejestracja użytkownika: przyjmuje e-mail, hasło, potwierdzenie hasła; walidacja danych i utworzenie konta przy użyciu Supabase Auth.

- **POST /api/auth/login**
  - Logowanie: przyjmuje e-mail i hasło; wykorzystuje Supabase Auth do weryfikacji i ustanowienia sesji.

- **POST /api/auth/logout**
  - Wylogowanie: kończy bieżącą sesję użytkownika za pomocą Supabase Auth.

- **POST /api/auth/password-reset**
  - Inicjacja procesu odzyskiwania hasła: przyjmuje e-mail i wysyła link resetujący.

- **POST /api/auth/password-update**
  - Aktualizacja hasła: przyjmuje nowe hasło i token z linku resetującego.

### 2.2 Modele danych
- **Supabase Auth**:
  - Główne dane użytkownika (email, hasło, id) są obsługiwane przez Supabase Auth..

### 2.3 Walidacja i obsługa wyjątków
- Użycie biblioteki walidacyjnej (np. Yup lub wbudowanych mechanizmów Supabase) do walidacji schematów danych.
- Standaryzacja odpowiedzi i kodów HTTP, logowanie błędów, oraz bezpieczne przechowywanie informacji o nieudanych próbach.
- Aktualizacja renderowania stron w Astro, uwzględniając mechanizmy autoryzacji i dynamiczne przekazywanie danych.

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth
- **Rejestracja**: 
  - Użycie metody `signUp` z Supabase do tworzenia użytkowników, wysyłania e-maila weryfikacyjnego oraz automatycznego logowania.

- **Logowanie**: 
  - Wykorzystanie metody `signIn` do uwierzytelnienia użytkownika na podstawie e-maila i hasła.

- **Wylogowywanie**: 
  - Użycie metody `signOut` do kończenia sesji.

- **Odzyskiwanie hasła**: 
  - Użycie funkcjonalności resetu hasła (np. `resetPasswordForEmail`) w Supabase, która generuje link do zmiany hasła.

### 3.2 Mechanizmy zabezpieczeń
- Wszystkie dane autentykacyjne (hasła, tokeny) są przetwarzane i przechowywane zgodnie z najlepszymi praktykami bezpieczeństwa.
- Przekazywanie i przechowywanie danych odbywa się za pomocą bezpiecznego połączenia (HTTPS).
- Wrażliwe operacje są chronione dodatkowymi warstwami weryfikacji.

### 3.3 Integracja z front-endem
- Klient Supabase jest zintegrowany w głównym module Astro, a dostęp do sesji użytkownika odbywa się poprzez Context/Hooki w React.
- Spójność między działaniami na interfejsie użytkownika (formularze) a backendem zapewnia ujednolicony przepływ informacji.

## KLUCZOWE WNIOSKI

- Moduł autentykacji jest ściśle zintegrowany z Supabase Auth, co gwarantuje bezpieczny, skalowalny oraz zgodny z RODO sposób obsługi danych użytkowników.
- Interfejs użytkownika jest podzielony na dwa główne obszary: publiczny (rejestracja, logowanie, odzyskiwanie hasła) oraz autoryzowany (aplikacja główna), co ułatwia zarządzanie nawigacją i dostępem do zasobów.
- Walidacja i obsługa błędów odbywa się na poziomie frontendu oraz backendu, co minimalizuje ryzyko błędów i zwiększa bezpieczeństwo danych.
- Struktura endpointów API oraz modele danych zostały zaprojektowane zgodnie z wymaganiami funkcjonalnymi, umożliwiając prostą integrację z istniejącą architekturą aplikacji opartej na Astro oraz React. 
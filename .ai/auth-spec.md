# Specyfikacja architektury modułu autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1 Struktura stron i komponentów

#### Nowe strony Astro (src/pages/auth/):
- `login.astro` - strona logowania
- `register.astro` - strona rejestracji
- `reset-password.astro` - strona resetowania hasła
- `new-password.astro` - strona ustawiania nowego hasła (po resecie)

#### Nowe komponenty React (src/components/auth/):
- `LoginForm.tsx` - formularz logowania
- `RegisterForm.tsx` - formularz rejestracji
- `ResetPasswordForm.tsx` - formularz resetowania hasła
- `NewPasswordForm.tsx` - formularz ustawiania nowego hasła
- `AuthHeader.tsx` - nagłówek z logo dla stron auth
- `UserMenu.tsx` - komponent menu użytkownika (email + wyloguj)

#### Modyfikacje istniejących komponentów:
- `src/layouts/Layout.astro` - dodanie warunkowego renderowania UserMenu w headerze dla zalogowanych użytkowników
- `src/components/Header.tsx` - integracja z UserMenu i obsługa stanu zalogowania

### 1.2 Przepływ użytkownika i walidacja

#### Rejestracja (US-001):
1. Użytkownik wchodzi na `/auth/register`
2. Wypełnia formularz (email + hasło + potwierdzenie hasła)
3. Walidacja client-side:
   - Email: format email, wymagane
   - Hasło: min. 8 znaków, wielka litera, cyfra, znak specjalny
   - Potwierdzenie hasła: zgodność z hasłem
4. Po poprawnej walidacji - wywołanie Supabase Auth
5. Obsługa odpowiedzi:
   - Sukces: przekierowanie do strony głównej
   - Błąd: wyświetlenie komunikatu (email zajęty/błąd serwera)

#### Logowanie (US-002):
1. Użytkownik wchodzi na `/auth/login`
2. Wypełnia formularz (email + hasło)
3. Walidacja client-side:
   - Email: format email, wymagane
   - Hasło: wymagane
4. Po poprawnej walidacji - wywołanie Supabase Auth
5. Obsługa odpowiedzi:
   - Sukces: przekierowanie do strony głównej
   - Błąd: wyświetlenie komunikatu (nieprawidłowe dane/błąd serwera)

#### Reset hasła:
1. Na stronie logowania link do `/auth/reset-password`
2. Formularz z polem email
3. Po wysłaniu - Supabase wysyła email z linkiem
4. Link kieruje do `/auth/new-password?token=xxx`
5. Formularz nowego hasła z walidacją jak przy rejestracji

#### Wylogowanie:
1. Przycisk w UserMenu
2. Po kliknięciu - wywołanie Supabase Auth logout
3. Przekierowanie do strony logowania

## 2. Logika backendowa

### 2.1 Endpointy API (src/pages/api/auth/):

```typescript
// Kontrakt dla odpowiedzi API
interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: {
      id: string;
      email: string;
    };
  };
}
```

#### Endpointy:
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- POST `/api/auth/reset-password`
- POST `/api/auth/new-password`

### 2.2 Middleware i kontrola dostępu

```typescript
// Lista ścieżek publicznych
const PUBLIC_PATHS = [
  "/auth/login", 
  "/auth/register", 
  "/auth/reset-password", 
  "/auth/new-password"
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect } = context;

  // Pomijamy sprawdzanie autoryzacji dla ścieżek publicznych
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServer({
    cookies,
    headers: request.headers,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Zgodnie z US-002: Użytkownik NIE MOŻE korzystać z aplikacji bez logowania
  if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/auth/login");
  }

  // Dodajemy informacje o użytkowniku do locals
  context.locals.user = user
    ? {
        id: user.id,
        email: user.email,
      }
    : null;

  return next();
});
```

### 2.3 Server-side rendering

Modyfikacja zachowania stron w trybie SSR:
- Strony auth dostępne tylko dla niezalogowanych (przekierowanie zalogowanych do strony głównej)
- Przekierowanie niezalogowanych ze stron chronionych do logowania
- Hydratacja stanu użytkownika w layoutach

```typescript
// Fragment kodu w stronach auth (np. login.astro)
---
import Layout from '../layouts/Layout.astro';
import LoginForm from '../components/auth/LoginForm';

// Sprawdzenie czy użytkownik jest już zalogowany
const { cookies, redirect } = Astro;
const supabase = createSupabaseServer({ cookies });
const { data: { user } } = await supabase.auth.getUser();

// Przekierowanie zalogowanych do strony głównej
if (user) {
  return redirect('/');
}
---

<Layout title="Logowanie">
  <LoginForm client:load />
</Layout>
```

### 2.4 Modele danych

Supabase Auth:
Główne dane użytkownika (email, hasło, id) są obsługiwane przez Supabase Auth.

## 3. System autentykacji (Supabase Auth)

### 3.1 Konfiguracja Supabase

```typescript
// src/lib/supabase.ts
interface SupabaseConfig {
  authRedirectTo: string; // Strona generowania fiszek po logowaniu
  passwordResetRedirectTo: string;
  cookies: {
    name: string;
    lifetime: number;
    domain: string;
    sameSite: string;
  };
}
```

### 3.2 Serwisy autentykacji (src/services/auth/):

#### AuthService
```typescript
interface AuthService {
  register(email: string, password: string): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<AuthResponse>;
  updatePassword(token: string, newPassword: string): Promise<AuthResponse>;
  getCurrentUser(): Promise<User | null>;
}
```

### 3.3 Bezpieczeństwo

- Szyfrowanie hasła po stronie Supabase
- Automatyczna rotacja tokenów sesji
- Walidacja tokenów resetowania hasła
- Limity prób logowania
- Bezpieczne przechowywanie tokenów w cookies (HttpOnly, Secure)
- CSRF protection

### 3.4 Obsługa sesji

- Automatyczne odświeżanie tokenów
- Wykrywanie wygaśnięcia sesji
- Synchronizacja stanu auth między zakładkami
- Czyszczenie danych po wylogowaniu

## 4. Uwagi implementacyjne

1. Wykorzystanie shadcn/ui dla spójności UI:
   - Komponenty formularzy
   - Komunikaty o błędach
   - Przyciski i pola input
   
2. Integracja z Tailwind:
   - Klasy dla layoutu auth
   - Style dla formularzy
   - Responsywność

3. TypeScript:
   - Pełne typowanie komponentów
   - Typowanie odpowiedzi API
   - Typowanie kontekstu auth

4. Testy:
   - Unit testy komponentów React
   - Testy integracyjne flow auth
   - Testy end-to-end głównych scenariuszy

5. Monitoring i debugowanie:
   - Logowanie błędów auth
   - Metryki prób logowania
   - Śledzenie resetów hasła
# Authentication & Authorization Flow in Next.js

Authentication and authorization system for Next.js 14+ applications,
covering email/password login, OAuth, session hydration, middleware route
protection, token refresh, idle timeout, cross-tab sync, and
permission-based access control.

## Directory Structure

`lib/auth/` in detail:

```
lib/auth/
├── index.ts                 # barrel re-exporting the whole module (import from '@/lib/auth')
├── Types/index.ts            # AuthUser, ILogin, ILoginResponse, AuthState/Actions, OAuthProvider, Permission
├── Config/index.ts           # endpoints, OAuth client IDs/authorize URLs, cookie names/options, PAGES routes
├── Actions/
│   ├── index.ts               # barrel: re-exports user.ts + cookies.ts (authService.ts is exported separately)
│   ├── authService.ts        # 'use server': restoreSessionToken, checkCookiesBeforeRoute, permissions
│   ├── cookies.ts            # 'use server': get/set/delete cookie primitives (next/headers)
│   └── user.ts               # 'use server': whenUserLogin (sets cookies), userLogout (clears cookies + redirects)
├── Call/
│   ├── index.ts               # barrel: re-exports client.ts + refreshToken.ts + server.ts
│   ├── client.ts             # fetchClient — browser fetch wrapper, 401 refresh-and-retry, 5xx/429 retry
│   ├── refreshToken.ts       # refreshToken — POSTs to the refresh endpoint (used by client + middleware)
│   └── server.ts             # 'server-only' fetchServer — RSC/server-side fetch using the access cookie
├── OAuth/index.ts            # startGoogleLogin / startGithubLogin (PKCE-less state flow), consumeOAuthState, getOAuthRedirectURL
├── Service/index.ts          # useAuthService hook: login/logout/loginWithOAuth + hydrates profile on mount via GET /me
├── Provider/
│   ├── index.ts               # barrel: re-exports AuthProvider, contexts, hooks, Idle/SyncTabs layers, authChannel
│   ├── AuthProvider.tsx       # provides auth context, wraps children in SyncTabs + Idle
│   ├── createContext.ts      # AuthStateContext / AuthActionsContext
│   └── useAuthContext.tsx    # useAuthState / useAuthActions hooks
├── Layers/
│   ├── index.ts               # barrel: re-exports Idle + SyncTabs
│   ├── Idle.tsx               # mounts useIdleTimeout
│   └── SyncTabs.tsx           # reloads the tab when another tab broadcasts 'logout'
├── Idle/index.ts             # useIdleTimeout — logs out after 15 min of inactivity
├── Sync/index.ts             # authChannel — BroadcastChannel('auth') for cross-tab events
├── Permissions/index.ts      # $checkPermissions — evaluates {permission}/{anyOf}/{allOf} requirements
├── Components/CanView.tsx    # permission-gated render helper (stub, not yet wired up)
└── utils/index.ts            # 'server-only': isExpired (JWT exp check), replaceCookie, redirectToLogin
```

## Features

- **Email/password login** with cookie-based sessions (`accessToken` +
  `refreshToken`, both httpOnly).
- **OAuth login (Google & GitHub)** — the client kicks off the authorize
  redirect with a CSRF `state` stashed in `sessionStorage`. A
  `/auth/callback/[provider]` page validates `state` and receives the
  `code`, but the code-exchange call (`loginWithOAuth`) is still commented
  out, so sign-in does not yet complete. See
  [Known Limitations](#known-limitations).
- **Automatic access-token refresh** — proactively in middleware (before an
  expired token ever hits a route) and reactively on the client (401 →
  refresh → retry, deduped across concurrent requests).
- **Protected routes via middleware** — `/dashboard/*` requires auth,
  `/auth/*` redirects away once logged in, and unauthenticated users are
  bounced to `/auth?backTo=<original path>`.
- **Session hydration on page load/refresh** — client React state is empty
  on a fresh load, so a `hasAuth` flag cookie triggers a `GET /me` to
  repopulate it without ever exposing the tokens to JS.
- **Idle timeout** — automatic logout after 15 minutes of no user activity.
- **Cross-tab logout sync** — logging out (or timing out) in one tab
  reloads/logs out every other open tab via `BroadcastChannel`.
- **Permission-based access control** — a `Permission` list per user, plus a
  `$checkPermissions` helper supporting single/`anyOf`/`allOf` requirement
  checks. The `CanView` render-guard component that will consume it is
  scaffolded but not yet implemented.
- **Separate client/server data-fetching helpers** — `fetchClient` for
  Client Components (cookie auth, retry/refresh logic) and `fetchServer`
  for Server Components/RSCs (reads the cookie directly, `server-only`).

## Auth State & Cookies

Auth state lives in two places at once: **httpOnly cookies** (source of
truth, server-verifiable) and **React context** (`AuthProvider`, for client
rendering). Nothing about the tokens is ever readable from client JS — only
a plain `hasAuth` flag cookie is, so the client can know _whether_ to try
hydrating a session without ever touching the tokens themselves.

All cookies are defined in
[lib/auth/Config/index.ts](lib/auth/Config/index.ts):

| Cookie         | httpOnly | Purpose                                                           |
| -------------- | -------- | ----------------------------------------------------------------- |
| `accessToken`  | yes      | short-lived JWT sent to the API                                   |
| `refreshToken` | yes      | long-lived token used to mint a new `accessToken`                 |
| `permissions`  | yes      | JSON array of the user's permissions                              |
| `hasAuth`      | no       | plain `'true'` flag the client reads to decide whether to hydrate |

## Flow Walkthrough

### 1. Login

[components/auth/Login.tsx](components/auth/Login.tsx) calls
`useAuthActions().login()`, which (in
[lib/auth/Service/index.ts](lib/auth/Service/index.ts)) `POST`s credentials
to `/auth-test` via `fetchClient`. The API response sets the
`accessToken`/`refreshToken` cookies (via `credentials: 'include'`); the
app then calls the `whenUserLogin` server action
([lib/auth/Actions/user.ts](lib/auth/Actions/user.ts)) to store
`permissions` and flip `hasAuth`, and mirrors the response into React
state.

### 2. OAuth login (Google/GitHub)

The "Continue with Google/GitHub" buttons in
[components/auth/Login.tsx](components/auth/Login.tsx) call
`startGoogleLogin`/`startGithubLogin`
([lib/auth/OAuth/index.ts](lib/auth/OAuth/index.ts)), which generate a
random `state`, stash it in `sessionStorage`, and redirect to the
provider's authorize URL. The provider redirects back to
`/auth/callback/[provider]`
([components/auth/Callback.tsx](components/auth/Callback.tsx)), which
validates the returned `state` via `consumeOAuthState` and reads the `code`
query param. Exchanging that `code` for a session via `loginWithOAuth`
([lib/auth/Service/index.ts](lib/auth/Service/index.ts)) is wired up but
currently commented out in `Callback.tsx`, so the flow stops at "Signing
you in…".

### 3. Session hydration on load

Since React context resets on every full page load but cookies persist,
`useAuthService` checks the `hasAuth` cookie on mount and, if set, calls
`GET /me` (`fetchClient`) to repopulate `user`/`permissions`/`role` in
context. If that call fails, it logs out.

### 4. Route protection (middleware)

[proxy.ts](proxy.ts) matches `/dashboard/:path*` and `/auth/:path*`:

- no `accessToken` + `refreshToken` pair → redirect to `/auth` (auth pages
  pass through)
- authenticated user hitting `/auth` → redirect to `/dashboard` (or
  `?backTo=`)
- `accessToken` still valid → continue
- `accessToken` expired → call `restoreSessionToken`, which refreshes the
  token server-side and forwards the request with the new cookie set; on
  failure, clears all auth cookies and redirects to `/auth`

### 5. Token refresh (client requests)

`fetchClient` ([lib/auth/Call/client.ts](lib/auth/Call/client.ts)) retries
once on a `401` by calling the shared `refreshOnce()` (deduped so
concurrent 401s trigger a single `/refresh` call via
[lib/auth/Call/refreshToken.ts](lib/auth/Call/refreshToken.ts)), then
replays the original request; it also retries on `5xx`/`429`. Server
Components instead use `fetchServer`
([lib/auth/Call/server.ts](lib/auth/Call/server.ts)), which reads the
`accessToken` cookie directly since there's no browser to hold it.

### 6. Logout

`userLogout` ([lib/auth/Actions/user.ts](lib/auth/Actions/user.ts)) is a
server action that deletes all four auth cookies and redirects to `/auth`.
It's triggered by the idle timer or the "Logout" button in
[components/auth/Profile.tsx](components/auth/Profile.tsx).

### 7. Idle timeout

[lib/auth/Idle/index.ts](lib/auth/Idle/index.ts) logs the user out after 15
minutes of no `keydown`/`click`/`scroll`/`touchstart`/`mousemove` activity
(throttled to one reset per 2s), mounted app-wide via the `Idle` layer in
`AuthProvider`.

### 8. Cross-tab sync

[lib/auth/Sync/index.ts](lib/auth/Sync/index.ts) exposes a
`BroadcastChannel('auth')` wrapper; the `SyncTabs` layer reloads the tab
whenever a `'logout'` event arrives, so a logout in one tab is reflected
everywhere.

### 9. Permissions

`$checkPermissions` ([lib/auth/Permissions/index.ts](lib/auth/Permissions/index.ts))
evaluates a `{ permission }` / `{ anyOf }` / `{ allOf }` requirement against
the user's permission list. `CanView`
([lib/auth/Components/CanView.tsx](lib/auth/Components/CanView.tsx)) is
meant to wrap that logic in a render-guard component but is currently a
stub.

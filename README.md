## Authentication & Authorization Flow in Next

Authentication and Authorization system flow for applications with next.js 15+.

### Auth Structure `lib/auth/` in detail

```
lib/auth/
├── index.ts                 # barrel re-exporting the whole module (import from '@/lib/auth')
├── Types/index.ts            # AuthUser, ILogin, ILoginResponse, AuthState/Actions, Permission
├── Config/index.ts           # endpoints, cookie names/options, PAGES routes
├── Actions/
│   ├── authService.ts        # 'use server': refreshToken, restoreSessionToken, checkCookiesBeforeRoute, permissions
│   ├── cookies.ts            # 'use server': get/set/delete cookie primitives (next/headers)
│   └── user.ts               # 'use server': whenUserLogin (sets cookies), userLogout (clears cookies + redirects)
├── Call/
│   ├── client.ts             # fetchClient — browser fetch wrapper, 401 refresh-and-retry, 5xx/429 retry
│   └── server.ts             # 'server-only' fetchServer — RSC/server-side fetch using the access cookie
├── Service/index.ts          # useAuthService hook: login/logout + hydrates profile on mount via GET /me
├── Provider/
│   ├── AuthProvider.tsx       # provides auth context, wraps children in SyncTabs + Idle
│   ├── createContext.ts      # AuthStateContext / AuthActionsContext
│   └── useAuthContext.tsx    # useAuthState / useAuthActions hooks
├── Layers/
│   ├── Idle.tsx               # mounts useIdleTimeout
│   └── SyncTabs.tsx           # reloads the tab when another tab broadcasts 'logout'
├── Idle/index.ts             # useIdleTimeout — logs out after 15 min of inactivity
├── Sync/index.ts             # authChannel — BroadcastChannel('auth') for cross-tab events
├── Permissions/index.ts      # $checkPermissions — evaluates {permission}/{anyOf}/{allOf} requirements
├── Components/CanView.tsx    # permission-gated render helper (stub, not yet wired up)
└── utils/index.ts            # 'server-only': isExpired (JWT exp check), replaceCookie, redirectToLogin
```

## Authentication Flow

### Features

- **Email/password login** with cookie-based sessions (`accessToken` + `refreshToken`, both httpOnly)
- **Automatic access-token refresh** — both proactively in middleware (before an expired token ever
  hits a route) and reactively on the client (401 → refresh → retry, deduped across concurrent requests)
- **Protected routes via middleware** — `/dashboard/*` requires auth, `/auth/*` redirects away once
  logged in, unauthenticated users are bounced to `/auth?backTo=<original path>`
- **Session hydration on page load/refresh** — client React state is empty on a fresh load, so a
  `hasAuth` flag cookie triggers a `GET /me` to repopulate it without ever exposing the tokens to JS
- **Idle timeout** — auto logout after 15 minutes of no user activity
- **Cross-tab logout sync** — logging out (or timing out) in one tab reloads/logs out every other
  open tab via `BroadcastChannel`
- **Permission-based access control** — `Permission` list per user plus a `$checkPermissions` helper
  supporting single/`anyOf`/`allOf` requirement checks (the `CanView` render-guard component that
  will consume it is scaffolded but not yet implemented)
- **Separate client/server data-fetching helpers** — `fetchClient` for Client Components (cookie
  auth, retry/refresh logic) and `fetchServer` for Server Components/RSCs (reads the cookie directly,
  `server-only`)
- **OAuth scaffolding (not implemented yet)** — Google/GitHub client IDs and authorize URLs are
  defined in `Config/index.ts`, and the buttons exist commented-out in `Login.tsx`, but no callback
  route or token exchange exists yet

Auth state lives in two places at once: **httpOnly cookies** (source of truth, server-verifiable)
and **React context** (`AuthProvider`, for client rendering). Nothing about the tokens is ever
readable from client JS — only a plain `hasAuth` flag cookie is, so the client can know _whether_
to try hydrating a session without ever touching the tokens themselves.

**Cookies** (all defined in [lib/auth/Config/index.ts](lib/auth/Config/index.ts)):

| Cookie         | httpOnly | Purpose                                                           |
| -------------- | -------- | ----------------------------------------------------------------- |
| `accessToken`  | yes      | short-lived JWT sent to the API                                   |
| `refreshToken` | yes      | long-lived token used to mint a new `accessToken`                 |
| `permissions`  | yes      | JSON array of the user's permissions                              |
| `hasAuth`      | no       | plain `'true'` flag the client reads to decide whether to hydrate |

**1. Login** — [components/auth/Login.tsx](components/auth/Login.tsx) calls
`useAuthActions().login()`, which (in
[lib/auth/Service/index.ts](lib/auth/Service/index.ts)) `POST`s credentials to `/auth-test` via
`fetchClient`. The API response sets the `accessToken`/`refreshToken` cookies (via
`credentials: 'include'`); the app then calls the `whenUserLogin` server action
([lib/auth/Actions/user.ts](lib/auth/Actions/user.ts)) to store `permissions` and flip `hasAuth`,
and mirrors the response into React state.

**2. Session hydration on load** — since React context resets on every full page load but cookies
persist, `useAuthService` checks the `hasAuth` cookie on mount and, if set, calls `GET /me`
(`fetchClient`) to repopulate `user`/`permissions`/`role` in context. If that call fails, it logs
out.

**3. Route protection (middleware)** — [proxy.ts](proxy.ts) matches `/dashboard/:path*` and
`/auth/:path*`:

- no `accessToken` + `refreshToken` pair → redirect to `/auth` (auth pages pass through)
- authenticated user hitting `/auth` → redirect to `/dashboard` (or `?backTo=`)
- `accessToken` still valid → continue
- `accessToken` expired → call `restoreSessionToken`, which refreshes the token server-side and
  forwards the request with the new cookie set; on failure, clears all auth cookies and redirects
  to `/auth`

**4. Token refresh (client requests)** — `fetchClient`
([lib/auth/Call/client.ts](lib/auth/Call/client.ts)) retries once on a `401` by calling the shared
`refreshOnce()` (deduped so concurrent 401s trigger a single `/refresh` call), then replays the
original request; it also retries on `5xx`/`429`. Server Components instead use `fetchServer`
([lib/auth/Call/server.ts](lib/auth/Call/server.ts)), which reads the `accessToken` cookie
directly since there's no browser to hold it.

**5. Logout** — `userLogout` ([lib/auth/Actions/user.ts](lib/auth/Actions/user.ts)) is a server
action that deletes all four auth cookies and redirects to `/auth`. It's triggered by the idle
timer or the "Logout" button in [components/auth/Profile.tsx](components/auth/Profile.tsx).

**6. Idle timeout** — [lib/auth/Idle/index.ts](lib/auth/Idle/index.ts) logs the user out after 15
minutes of no `keydown`/`click`/`scroll`/`touchstart`/`mousemove` activity (throttled to one reset
per 2s), mounted app-wide via the `Idle` layer in `AuthProvider`.

**7. Cross-tab sync** — [lib/auth/Sync/index.ts](lib/auth/Sync/index.ts) exposes a
`BroadcastChannel('auth')` wrapper; the `SyncTabs` layer reloads the tab whenever a `'logout'`
event arrives, so a logout in one tab is reflected everywhere.

**8. Permissions** — `$checkPermissions`
([lib/auth/Permissions/index.ts](lib/auth/Permissions/index.ts)) evaluates a
`{ permission }` / `{ anyOf }` / `{ allOf }` requirement against the user's permission list.
`CanView` ([lib/auth/Components/CanView.tsx](lib/auth/Components/CanView.tsx)) is meant to wrap
that logic in a render-guard component but is currently a stub.

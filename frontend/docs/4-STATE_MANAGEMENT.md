# 4. State Management

This document describes the data layer architecture for the React frontend. It uses TanStack Query for server state, React Hook Form for form state, and cookie‑based authentication with Axios interceptors.

## 1. Authentication State

- **Cookie‑based sessions** are used instead of JWT stored in `localStorage`.
- The backend sets an HTTP‑only cookie `imas_session` after login. The frontend never reads or stores this cookie directly; it is automatically sent with `withCredentials: true`.
- CSRF protection requires an `X-CSRF-Token` header on all mutations. The token is fetched from `GET /auth/csrf` and stored in memory (React context or a module variable). It is not persisted to `localStorage`.

### Auth Context

We will create an `AuthProvider` using React Context to hold:
- `user: UserProfile | null`
- `isAuthenticated: boolean`
- `isLoading: boolean`
- `csrfToken: string | null`

On mount, the provider calls `GET /auth/me` with `withCredentials: true` to restore the session.

### Axios Instance

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

// Request interceptor: attach CSRF token if available
api.interceptors.request.use((config) => {
  if (['post', 'patch', 'delete', 'put'].includes(config.method)) {
    const csrfToken = csrfStore.getToken();
    if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 2. Server State with TanStack Query

All server data is fetched and mutated via custom hooks built on `useQuery`, `useMutation`, and `useQueryClient`.

### Query Keys

Query keys follow a consistent hierarchical pattern: `['domain', 'entity', idOrFilter]`.

Examples:
- `['auth', 'me']`
- `['users']`
- `['users', userId]`
- `['departments']`
- `['companies']`
- `['document-types']`
- `['internships', internshipId]`
- `['internships']`
- `['daily-logs', internshipId]`
- `['sgk']`
- `['system-configs', 'public']`
- `['system-configs', 'admin']`

### Cache and Invalidation

- `staleTime`: 5 minutes for most GET requests.
- `cacheTime`: 30 minutes.
- After successful mutation, invalidate related queries using `queryClient.invalidateQueries({ queryKey: [...] })`.

Example after uploading a document:
```ts
queryClient.invalidateQueries({ queryKey: ['application-documents', internshipId] });
```

### Mutation Patterns

Use `useMutation` with `onSuccess` callbacks to show toasts and refetch/invalidate.

```ts
const createCompany = useMutation({
  mutationFn: (data) => api.post('/companies', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    toast.success('Company created');
  },
});
```

## 3. Client State with React Hook Form

Forms are managed with `react-hook-form` and validated using `zod` or class‑validator‑compatible schemas.

### Example Hook

```ts
const form = useForm<LoginRequest>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});
```

On submit, call the appropriate mutation.

## 4. File Uploads

File uploads use `FormData` with Axios. They do not use JSON. The Axios instance automatically sets the correct `Content-Type: multipart/form-data` when receiving `FormData`.

```ts
const formData = new FormData();
formData.append('file', file);
formData.append('documentTypeId', docTypeId);
await api.post(`/internships/${internshipId}/documents`, formData);
```

## 5. Error Handling

- **Global error boundary** catches rendering errors.
- **Axios response interceptor** maps HTTP status codes to user‑friendly messages using a toast system.
- **React Query `onError`** can override global handlers for specific mutations.

## 6. Persistence

- **Do not persist sensitive data** (JWT, CSRF, user password) in `localStorage` or `sessionStorage`.
- Only non‑sensitive UI preferences (e.g., sidebar collapsed state) may be stored in `localStorage`.
- CSRF token is kept in memory only and refreshed on login or via `GET /auth/csrf`.

## 7. Dependencies Summary

- `@tanstack/react-query` – server state and caching.
- `axios` – HTTP client.
- `react-hook-form` + `zod` – forms and validation.
- `lucide-react` – icons.
- `tailwindcss` – styling.
- `react-router-dom` – routing.
let csrfToken: string | null = null

export const csrfStore = {
  getToken: () => csrfToken,
  setToken: (token: string | null) => { csrfToken = token },
  clear: () => { csrfToken = null },
}

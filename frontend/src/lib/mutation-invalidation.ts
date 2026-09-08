import type { QueryClient, QueryKey } from '@tanstack/react-query'

/** Invalidate every server-state key affected by a successful mutation. */
export function invalidateDomainQueries(queryClient: QueryClient, queryKeys: readonly QueryKey[]) {
  return Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

import { useQueryClient } from '@tanstack/vue-query'
import { getListItemsQueryKey } from '@/api/generated/endpoints'

export function useInvalidateItems() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() })
}

// 暫定。Task 4 で本実装する。
export const customFetch = async <T>(config: {
  url: string
  method: string
  data?: unknown
  params?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}): Promise<T> => {
  throw new Error('not implemented yet')
}

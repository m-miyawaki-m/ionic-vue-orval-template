// orval の override.mutator が呼び出す共通 fetch 実装。
// 本番は baseURL を実APIに向ける。dev/Storybook では MSW が横取りする。
export interface RequestConfig {
  url: string
  // 生成コードは 'GET' / 'POST' などの大文字メソッドを渡すため string で受ける。
  method: string
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const customFetch = async <T>(config: RequestConfig): Promise<T> => {
  const { url, method, params, data, headers, signal } = config
  const query = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''

  const res = await fetch(`${BASE_URL}${url}${query}`, {
    method: method.toUpperCase(),
    headers: { 'Content-Type': 'application/json', ...headers },
    body: data !== undefined ? JSON.stringify(data) : undefined,
    signal,
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${method.toUpperCase()} ${url}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export default customFetch

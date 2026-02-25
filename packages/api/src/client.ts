export interface ApiFetchAdapter {
  request(path: string, method: 'GET' | 'POST', body: string | null): Promise<string>;
}

export async function fetchJson<T>(
  adapter: ApiFetchAdapter,
  path: string,
  method: 'GET' | 'POST'
): Promise<T> {
  const raw = await adapter.request(path, method, null);
  return JSON.parse(raw) as T;
}

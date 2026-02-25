import { describe, expect, it } from 'vitest';
import { fetchJson } from './client';

describe('fetchJson', function () {
  it('parses adapter JSON responses', async function () {
    const adapter = {
      request: async function () {
        return '{"id":"1","title":"Analyst"}';
      },
    };

    const result = await fetchJson<{ id: string; title: string }>(adapter, '/jobs/1', 'GET');
    expect(result.id).toBe('1');
    expect(result.title).toBe('Analyst');
  });
});

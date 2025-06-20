import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFundData } from './useFundData';

const mockUrls = {
  funds: [
    { id: '1', url: 'https://mock.api/fund-1' },
    { id: '2', url: 'https://mock.api/fund-2' },
  ],
};

const mockFundResponses: Record<string, { data: { quote: { name: string } } }> = {
  'https://mock.api/fund-1': { data: { quote: { name: 'Mock Fund 1' } } },
  'https://mock.api/fund-2': { data: { quote: { name: 'Mock Fund 2' } } },
};

beforeEach(() => {
  vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
    const url = input.toString();
    const response = mockFundResponses[url];

    if (response) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
      } as Response);
    }

    return Promise.reject(new Error('Not Found'));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFundData hook', () => {
  it('returns initial loading state', async () => {
    const { result } = renderHook(() => useFundData(mockUrls));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.funds).toEqual({});
  });

  it('loads fund data successfully', async () => {
    const { result } = renderHook(() => useFundData(mockUrls));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.funds.funds).toHaveLength(2);
    expect(result.current.funds.funds[0].data.quote.name).toBe('Mock Fund 1');
    expect(result.current.funds.funds[1].data.quote.name).toBe('Mock Fund 2');
  });

  it('handles fetch failure gracefully', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('Failed to fetch')));

    const { result } = renderHook(() => useFundData(mockUrls));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load fund data');
    expect(result.current.funds).toEqual({});
  });
});

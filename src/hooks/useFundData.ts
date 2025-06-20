import { useEffect, useState } from 'react';
import type { FundApiResponse } from '../types/FundTypes';

interface FundMeta {
  id: string;
  url: string;
}

type FundUrls = Record<string, FundMeta[]>;

type FundData = Record<
  string,
  {
    id: string;
    data: FundApiResponse;
  }[]
>;

const defaultFundUrls: FundUrls = {
  growthFundVariations: [
    { id: 'BYW8RV9', url: '/api/interview/BYW8RV9.json' },
    { id: 'BYW8RX1', url: '/api/interview/BYW8RX1.json' },
    { id: 'BYW8VG2', url: '/api/interview/BYW8VG2.json' }
  ],
  responsibleGrowthFunds: [
    { id: 'BN0S2V9', url: '/api/interview/BN0S2V9.json' }
  ]
};

export const useFundData = (urls: FundUrls = defaultFundUrls) => {
  const [funds, setFunds] = useState<FundData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allFunds = Object.entries(urls).flatMap(([category, funds]) =>
      funds.map(fund => ({ ...fund, category }))
    );

    const fetchData = async () => {
      try {
        const results: FundData = {};

        for (const { id, url, category } of allFunds) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          const json = await res.json();
          const fundData = json?.data ?? json;

          if (!results[category]) results[category] = [];
          results[category].push({ id, data: fundData });
        }

        setFunds(results);
      } catch (err) {
        setError('Failed to load fund data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urls]);

  return { funds, loading, error };
};

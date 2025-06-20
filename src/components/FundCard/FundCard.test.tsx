import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { FundCard } from './FundCard';
import type { HeaderProps } from '../Header/Header';

vi.mock('../../components', () => ({
  Header: ({ as: As, children }: HeaderProps) => <As>{children}</As>,
}));

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(global).ResizeObserver = ResizeObserver;

const mockFund = {
  quote: {
    name: 'Test Fund',
    lastPriceDate: '2023-06-15',
    lastPrice: 123.4567,
    currency: 'USD',
    ongoingCharge: 1.23,
    sectorName: 'Technology',
    marketCode: 'Tech'
  },
  ratings: {
    analystRating: 4,
    analystRatingLabel: "Neutral",
    SRRI: 5,
  },
  profile: {
    objective: 'Test objective',
  },
  portfolio: {
    asset: [
      { label: 'Stocks', value: 70 },
      { label: 'Bonds', value: 30 },
    ],
    top10Holdings: [
      { name: 'Company A', weighting: 20.5 },
      { name: 'Company B', weighting: 15.0 },
    ],
  },
  documents: [
    { id: 'doc1', type: 'Prospectus', url: 'http://example.com/doc1' },
  ],
};

describe('FundCard', () => {
  let onExpand = vi.fn();
  let onCollapse = vi.fn();

  beforeEach(() => {
    onExpand;
    onCollapse;
    localStorage.clear();
  });

  it('renders fund name and ratings correctly', () => {
    render(
      <FundCard
        fund={mockFund}
        isExpanded={false}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('Test Fund');
    expect(screen.getByText('★★★★☆')).toBeInTheDocument();
    expect(screen.getByText('SRRI: 5')).toBeInTheDocument();
  });

  it('toggles expand/collapse on click', () => {
    const { rerender } = render(
      <FundCard
        fund={mockFund}
        isExpanded={false}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onExpand).toHaveBeenCalled();

    rerender(
      <FundCard
        fund={mockFund}
        isExpanded={true}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onCollapse).toHaveBeenCalled();
  });

  it('renders the tabs and changes tab on click', () => {
    render(
      <FundCard
        fund={mockFund}
        isExpanded={true}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );


    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Overview');
    expect(screen.getByText('Test objective')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Portfolio' }));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Portfolio');
    expect(screen.getByText('Asset Allocation & Top Holdings')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Documents' }));
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Documents');
    expect(screen.getByText('Prospectus')).toBeInTheDocument();
  });

   it('saves and restores active tab in localStorage', () => {
    const storageKey = `fundCardActiveTab-${mockFund.quote.name}`;

    render(
      <FundCard
        fund={mockFund}
        isExpanded={true}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );
    expect(localStorage.getItem(storageKey)).toBe('overview');

    fireEvent.click(screen.getByRole('tab', { name: 'Portfolio' }));
    expect(localStorage.getItem(storageKey)).toBe('portfolio');

    cleanup();

    render(
      <FundCard
        fund={mockFund}
        isExpanded={true}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Portfolio');
  });

  it('does not expand content when isExpanded is false', () => {
    render(
      <FundCard
        fund={mockFund}
        isExpanded={false}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );

    expect(screen.queryByRole('tabpanel')).toBeNull();
  });

  it('formats latest price date in DD/MM/YYYY format', () => {
    render(
      <FundCard
        fund={mockFund}
        isExpanded={true}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );

    expect(screen.getByText(/as of 15\/06\/2023/)).toBeInTheDocument();
  });

  it('displays price with 2 decimal places', () => {
    render(
      <FundCard
        fund={mockFund}
        isExpanded={true}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );

    expect(screen.getByText('Latest Price:')).toBeInTheDocument();
    expect(screen.getByText(/123\.46/)).toBeInTheDocument();
  });
});

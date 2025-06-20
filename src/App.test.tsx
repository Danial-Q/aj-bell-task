import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import App from './App';
import { useFundData } from './hooks/useFundData';
import type { FundApiResponse } from './types/FundTypes';

import type { PillToggleProps } from './components/PillToggle/PillToggle';
import type { HeaderProps } from './components/Header/Header';
import type { FundCardProps } from './components/FundCard/FundCard';

const mockedUseFundData = vi.mocked(useFundData);

vi.mock('./hooks/useFundData');
vi.mock('./components', async () => {
  const actual = await vi.importActual<typeof import('./components')>('./components');
  return {
    ...actual,
    Header: ({ as: As, children }: HeaderProps) => <As>{children}</As>,
    PillToggle: ({ options, selected, onChange }: PillToggleProps) => (
      <div>
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            data-selected={selected === opt}
          >
            {opt}
          </button>
        ))}
      </div>
    ),
    FundCard: ({ fund, isExpanded, onExpand, onCollapse }: FundCardProps) => (
      <div>
        <h3>{fund.quote.name}</h3>
        {isExpanded ? (
          <button onClick={onCollapse}>Collapse</button>
        ) : (
          <button onClick={onExpand}>Expand</button>
        )}
      </div>
    ),
  };
});

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders loading state', () => {
    mockedUseFundData.mockReturnValue({
      funds: {},
      loading: true,
      error: null,
    });

    render(<App />);
    expect(screen.getByText(/Loading funds/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockedUseFundData.mockReturnValue({
      funds: {},
      loading: false,
      error: 'Something went wrong',
    });

    render(<App />);
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('renders fund types and cards, allows selection', async () => {
    mockedUseFundData.mockReturnValue({
      funds: {
        equity: [
          { id: 'eq1', data: { quote: { name: 'Equity Fund 1' } } as unknown as FundApiResponse },
          { id: 'eq2', data: { quote: { name: 'Equity Fund 2' } } as unknown as FundApiResponse },
        ],
        bond: [
          { id: 'bd1', data: { quote: { name: 'Bond Fund 1' } } as unknown as FundApiResponse },
        ]
      },
      loading: false,
      error: null,
    });

    render(<App />);
    
    expect(screen.getByRole('heading', { name: /Welcome to the fund selector/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Please select your type of investment/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Equity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bond/i })).toBeInTheDocument();;

    expect(screen.getByText(/Equity Fund 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Equity Fund 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Bond/i));

    await waitFor(() => {
      expect(screen.getByText(/Bond Fund 1/i)).toBeInTheDocument();
    });
  });

  it('saves selection to localStorage', async () => {
    mockedUseFundData.mockReturnValue({
      funds: {
        equity: [
          { id: 'eq1', data: { quote: { name: 'Equity Fund 1' } } as unknown as FundApiResponse },
          { id: 'eq2', data: { quote: { name: 'Equity Fund 2' } } as unknown as FundApiResponse },
        ],
      },
      loading: false,
      error: null,
    });

    render(<App />);

    fireEvent.click(screen.getAllByText('Expand')[0]);

    expect(localStorage.getItem('selectedFundId')).toBe('eq1');
  });

  it('restores fund type + id from localStorage', async () => {
    localStorage.setItem('selectedFundType', 'equity');
    localStorage.setItem('selectedFundId', 'eq2');

    mockedUseFundData.mockReturnValue({
      funds: {
        equity: [
          { id: 'eq1', data: { quote: { name: 'Equity Fund 1' } } as unknown as FundApiResponse },
          { id: 'eq2', data: { quote: { name: 'Equity Fund 2' } } as unknown as FundApiResponse },
        ],
        bond: [
          { id: 'bd1', data: { quote: { name: 'Bond Fund 1' } } as unknown as FundApiResponse },
        ]
      },
      loading: false,
      error: null,
    });

    render(<App />);

    expect(screen.getByText(/Equity Fund 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Equity Fund 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Collapse/));
    expect(localStorage.getItem('selectedFundId')).toBe(null); 
  });
});

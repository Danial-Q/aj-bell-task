import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './Header';

describe('Header component', () => {
  it('renders the correct heading level', () => {
    render(<Header as="h2">Test Heading</Header>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders with class "header"', () => {
    render(<Header as="h3">Another Heading</Header>);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveClass('header');
  });

  it('renders children correctly', () => {
    render(<Header as="h4">Child Text</Header>);
    expect(screen.getByText('Child Text')).toBeInTheDocument();
  });
});

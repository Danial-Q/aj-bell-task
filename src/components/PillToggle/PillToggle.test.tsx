import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PillToggle } from './PillToggle';

describe('PillToggle', () => {
  const options = ['Option 1', 'Option 2', 'Option 3'];

  it('renders all options', () => {
    render(<PillToggle options={options} selected="Option 1" onChange={() => {}} />);
    options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('applies "active" class to the selected option', () => {
    render(<PillToggle options={options} selected="Option 2" onChange={() => {}} />);
    const activeButton = screen.getByText('Option 2');
    expect(activeButton).toHaveClass('active');
    options.filter(option => option !== 'Option 2').forEach(option => {
      expect(screen.getByText(option)).not.toHaveClass('active');
    });
  });

  it('calls onChange with correct value when an option is clicked', () => {
    const onChangeMock = vi.fn();
    render(<PillToggle options={options} selected="Option 1" onChange={onChangeMock} />);

    const buttonToClick = screen.getByText('Option 3');
    fireEvent.click(buttonToClick);

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith('Option 3');
  });

  it('sets aria-pressed correctly', () => {
    render(<PillToggle options={options} selected="Option 1" onChange={() => {}} />);
    options.forEach(option => {
      const btn = screen.getByText(option);
      if (option === 'Option 1') {
        expect(btn).toHaveAttribute('aria-pressed', 'true');
      } else {
        expect(btn).toHaveAttribute('aria-pressed', 'false');
      }
    });
  });
});

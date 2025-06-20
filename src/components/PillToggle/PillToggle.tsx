import React, { useRef, useEffect, useState } from 'react';
import './PillToggle.css';

export interface PillToggleProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export const PillToggle = ({ options, selected, onChange }: PillToggleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!containerRef.current) return;
    const index = options.indexOf(selected);
    if (index === -1) return;

    const buttons = containerRef.current.querySelectorAll('button.pill');
    const button = buttons[index] as HTMLButtonElement;
    if (!button) return;

    setHighlightStyle({
      width: button.offsetWidth,
      transform: `translateX(${button.offsetLeft}px)`,
    });
  }, [selected, options]);

  return (
    <div className="pill-toggle-slider" ref={containerRef}>
      <div className="highlight" style={highlightStyle} />
      {options.map(option => (
        <button
          key={option}
          type="button"
          className={`pill ${selected === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
          aria-pressed={selected === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

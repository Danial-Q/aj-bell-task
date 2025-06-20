import React from 'react';
import './Header.css';

export interface HeaderProps {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export const Header = ({ as: HeadingTag, children }: HeaderProps) => {
  return <HeadingTag className={`header`}>{children}</HeadingTag>;
};


import React from 'react';
import { Header } from './Header';

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};
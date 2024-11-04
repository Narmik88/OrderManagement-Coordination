import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-indigo-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center">
        <LayoutDashboard className="w-8 h-8 mr-3" />
        <h1 className="text-2xl font-bold">Order Management & Coordination</h1>
      </div>
    </header>
  );
};
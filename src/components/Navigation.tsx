import React from 'react';
import { useWallet } from '../context/WalletContext';
import { ViewTab } from '../types';
import { Home, History, Tags, Settings, Plus } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, setEditingTransaction } = useWallet();

  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Hoje', icon: <Home className="w-5 h-5" /> },
    { id: 'history', label: 'Histórico', icon: <History className="w-5 h-5" /> },
    { id: 'categories', label: 'Categorias', icon: <Tags className="w-5 h-5" /> },
    { id: 'settings', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsQuickAddOpen(true);
  };

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-3 py-2 flex items-center justify-around shadow-lg"
    >
      {/* First two items */}
      {navItems.slice(0, 2).map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
              isActive ? 'text-[#159FEF]' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            {item.icon}
            <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#159FEF] absolute -bottom-0.5" />
            )}
          </button>
        );
      })}

      {/* Center Action Button (+) */}
      <div className="flex-1 flex justify-center -mt-6">
        <button
          id="quick-add-transaction-btn"
          onClick={handleOpenAdd}
          aria-label="Adicionar movimentação"
          className="w-13 h-13 rounded-2xl bg-[#159FEF] hover:bg-[#0D7EBF] text-white flex items-center justify-center shadow-lg shadow-[#159FEF]/30 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Last two items */}
      {navItems.slice(2).map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
              isActive ? 'text-[#159FEF]' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            {item.icon}
            <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#159FEF] absolute -bottom-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

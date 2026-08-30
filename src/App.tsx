import React from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { OnboardingView } from './components/OnboardingView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { CategoriesView } from './components/CategoriesView';
import { SettingsView } from './components/SettingsView';
import { Navigation } from './components/Navigation';
import { TransactionModal } from './components/TransactionModal';
import { Toast } from './components/Toast';
import { PingoMascot } from './components/PingoMascot';
import { Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { data, activeTab } = useWallet();

  // If user has not completed initial offline onboarding, show welcome configuration
  if (!data.hasCompletedOnboarding) {
    return (
      <>
        <OnboardingView />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#102A43] flex justify-center selection:bg-[#159FEF] selection:text-white">
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#F0F4F8] relative sm:border-x sm:border-[#D9E2EC] shadow-sm">
        {/* Top Minimalist Header */}
        <header
          id="app-header"
          className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <PingoMascot mood="calm" size={28} />
            <div className="leading-tight">
              <span className="text-sm font-black tracking-tight text-[#102A43] flex items-center gap-1">
                pingowallet<span className="text-[#159FEF]">10</span>
              </span>
              <span className="block text-[10px] text-[#627D98] font-medium">Finanças Simples</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full"
              title="100% Offline e Privativo"
            >
              <Shield className="w-3 h-3" />
              <span>Offline</span>
            </div>
          </div>
        </header>

        {/* Dynamic Screen / View Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'categories' && <CategoriesView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Global Bottom Navigation */}
        <Navigation />

        {/* Global Modal for Creating / Editing transactions */}
        <TransactionModal />

        {/* Global Toast for Actions */}
        <Toast />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <MainContent />
    </WalletProvider>
  );
}

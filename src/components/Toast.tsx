import React from 'react';
import { useWallet } from '../context/WalletContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useWallet();

  if (!toastMessage) return null;

  return (
    <div
      id="app-toast"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xs w-[90%] bg-[#102A43] text-white border border-[#102A43] shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <CheckCircle className="w-5 h-5 text-[#159FEF] shrink-0" />
      <p className="text-xs font-bold leading-tight text-white">{toastMessage}</p>
    </div>
  );
};

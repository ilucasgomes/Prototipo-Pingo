import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { PaymentFrequency } from '../types';
import { PingoMascot } from './PingoMascot';
import { Calendar, Clock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FrequencyOption {
  id: PaymentFrequency;
  title: string;
  subtitle: string;
  icon: typeof Calendar;
  badge: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    id: 'weekly',
    title: 'Semanal',
    subtitle: 'Recebo toda semana',
    icon: Clock,
    badge: '7 dias',
  },
  {
    id: 'biweekly',
    title: 'Quinzenal',
    subtitle: 'Recebo a cada duas semanas',
    icon: Calendar,
    badge: '14/15 dias',
  },
  {
    id: 'monthly',
    title: 'Mensal',
    subtitle: 'Recebo uma vez por mês',
    icon: Sparkles,
    badge: 'Mês inteiro',
  },
];

export const OnboardingView: React.FC = () => {
  const { completeOnboarding } = useWallet();
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<PaymentFrequency | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0 && frequency !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !frequency || isSubmitting) return;

    setIsSubmitting(true);
    completeOnboarding({
      name: trimmedName,
      paymentFrequency: frequency,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#102A43] flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* Top Header & Mascot */}
      <div className="pt-4 sm:pt-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F5DFC5]/40 border border-[#F5B82E]/30 rounded-2xl shadow-2xs">
            <PingoMascot mood="happy" size={44} />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#159FEF] bg-[#159FEF]/10 px-2.5 py-0.5 rounded-full">
              pingowallet10
            </span>
            <p className="text-xs text-[#627D98] font-medium mt-0.5">Seu companheiro financeiro offline</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
            Antes da gente começar 👋
          </h1>
          <p className="text-sm text-[#486581] leading-relaxed">
            Me conta só duas coisas para eu organizar o Pingo do seu jeito.
          </p>
        </div>

        {/* Main Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Question 1: Name */}
          <div className="space-y-2">
            <label htmlFor="user-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#334E68]">
              Como posso te chamar?
            </label>
            <div className="relative">
              <input
                id="user-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={40}
                autoFocus
                className="w-full bg-white border-2 border-[#D9E2EC] focus:border-[#159FEF] focus:ring-4 focus:ring-[#159FEF]/15 text-[#102A43] placeholder-[#9FB3C8] rounded-2xl px-4 py-3.5 text-base font-semibold outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Question 2: Payment Frequency Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#334E68]">
                Como você recebe?
              </label>
              {frequency && (
                <span className="text-[11px] text-[#159FEF] font-bold animate-in fade-in">
                  Selecionado
                </span>
              )}
            </div>

            <div className="space-y-2.5" role="radiogroup" aria-label="Frequência de pagamento">
              {FREQUENCY_OPTIONS.map((opt) => {
                const isSelected = frequency === opt.id;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    id={`frequency-opt-${opt.id}`}
                    onClick={() => setFrequency(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-white border-[#159FEF] ring-4 ring-[#159FEF]/15 shadow-sm'
                        : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] text-[#627D98]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#159FEF] text-white shadow-xs'
                            : 'bg-[#F0F4F8] text-[#627D98]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold transition-colors ${
                              isSelected ? 'text-[#102A43]' : 'text-[#334E68]'
                            }`}
                          >
                            {opt.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#E0F2FE] text-[#0284C7]'
                                : 'bg-[#F0F4F8] text-[#829AB1]'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#627D98] mt-0.5 font-medium">{opt.subtitle}</p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#159FEF] bg-[#159FEF] text-white'
                          : 'border-[#CBD5E1] bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-[#F0F4F8]/70 border border-[#E2E8F0] rounded-2xl text-[11px] text-[#627D98] leading-relaxed flex items-center gap-2">
            <span>🔒</span>
            <span>Sem cadastro ou senhas. Suas respostas ficam apenas neste aparelho.</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="onboarding-continue-btn"
              disabled={!isValid || isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                isValid
                  ? 'bg-[#159FEF] hover:bg-[#0D7EBF] active:scale-[0.98] text-white shadow-[#159FEF]/25 cursor-pointer'
                  : 'bg-[#D9E2EC] text-[#9FB3C8] cursor-not-allowed shadow-none'
              }`}
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Footer Branding */}
      <div className="py-4 text-center">
        <p className="text-[11px] font-semibold text-[#9FB3C8]">
          pingowallet10 • finanças simples e tranquilas
        </p>
      </div>
    </div>
  );
};

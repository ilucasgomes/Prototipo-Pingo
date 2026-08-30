import React, { useState, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { PaymentFrequency } from '../types';
import { PingoMascot } from './PingoMascot';
import { formatCentsToBRL, parseInputToCents } from '../utils/formatters';
import { Download, Upload, Trash2, ShieldCheck, Target, AlertTriangle, Check, X, FileText, User, Calendar, Clock, Sparkles } from 'lucide-react';

interface FrequencyOption {
  id: PaymentFrequency;
  title: string;
  subtitle: string;
  icon: typeof Calendar;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { id: 'weekly', title: 'Semanal', subtitle: 'Recebo toda semana', icon: Clock },
  { id: 'biweekly', title: 'Quinzenal', subtitle: 'Recebo a cada duas semanas', icon: Calendar },
  { id: 'monthly', title: 'Mensal', subtitle: 'Recebo uma vez por mês', icon: Sparkles },
];

export const SettingsView: React.FC = () => {
  const { data, updateUserProfile, updateSettings, exportBackup, importBackup, resetAll } = useWallet();

  const initialProfileName = data.userProfile?.name || data.settings.userName || '';
  const initialFrequency = data.userProfile?.paymentFrequency || 'monthly';

  const [userNameInput, setUserNameInput] = useState(initialProfileName);
  const [selectedFrequency, setSelectedFrequency] = useState<PaymentFrequency>(initialFrequency);

  const [rawBudget, setRawBudget] = useState(
    data.settings.monthlyExpenseLimitCents > 0
      ? (data.settings.monthlyExpenseLimitCents / 100).toFixed(2).replace('.', ',')
      : ''
  );

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  // Import backup state & preview modal
  const [pendingBackupContent, setPendingBackupContent] = useState<string | null>(null);
  const [pendingBackupStats, setPendingBackupStats] = useState<{
    txCount: number;
    catCount: number;
    exportDate?: string;
    version?: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userNameInput.trim();
    if (!trimmed) return;
    updateUserProfile({
      name: trimmed,
      paymentFrequency: selectedFrequency,
    });
  };

  const handleSelectFrequency = (freq: PaymentFrequency) => {
    setSelectedFrequency(freq);
    updateUserProfile({
      name: userNameInput.trim() || initialProfileName,
      paymentFrequency: freq,
    });
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseInputToCents(rawBudget);
    updateSettings({ monthlyExpenseLimitCents: cents });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) {
            setImportError('Arquivo inválido: o backup não contém a estrutura exigida de transações e categorias.');
            return;
          }

          setPendingBackupContent(content);
          setPendingBackupStats({
            txCount: parsed.transactions.length,
            catCount: parsed.categories.length,
            exportDate: parsed.lastUpdated || parsed.exportDate,
            version: parsed.version || 1,
          });
        } catch (err: any) {
          setImportError('Erro ao ler o arquivo JSON: ' + (err?.message || 'formato corrompido'));
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    if (!pendingBackupContent) return;

    const res = importBackup(pendingBackupContent);
    if (res.success) {
      setPendingBackupContent(null);
      setPendingBackupStats(null);
      setImportError(null);
      const loaded = data.userProfile;
      if (loaded) {
        setUserNameInput(loaded.name || '');
        setSelectedFrequency(loaded.paymentFrequency || 'monthly');
      }
    } else {
      setImportError(res.error || 'Erro ao restaurar backup.');
    }
  };

  const handleCancelImport = () => {
    setPendingBackupContent(null);
    setPendingBackupStats(null);
    setImportError(null);
  };

  const handleConfirmReset = () => {
    if (resetCodeInput.trim().toUpperCase() === 'ZERAR') {
      resetAll();
      setShowResetConfirm(false);
      setResetCodeInput('');
      setResetError(null);
      setUserNameInput('');
      setSelectedFrequency('monthly');
    } else {
      setResetError('Digite "ZERAR" exatamente para confirmar a exclusão.');
    }
  };

  return (
    <div id="settings-view" className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-[#102A43] tracking-tight">Ajustes & Perfil</h1>
        <p className="text-xs text-[#627D98]">Personalize seu nome, frequência de ganhos e preferências</p>
      </div>

      {/* Perfil do Usuário & Frequência de Recebimento Bento Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
          <User className="w-4 h-4 text-[#159FEF]" />
          <span>Seu Perfil no Pingo</span>
        </div>

        {/* Nome */}
        <form onSubmit={handleSaveProfile} className="space-y-2">
          <label htmlFor="settings-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#627D98]">
            Como você quer ser chamado?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="settings-name-input"
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={40}
              className="flex-1 bg-[#F0F4F8] border border-[#E2E8F0] focus:border-[#159FEF] text-[#102A43] text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none"
            />
            <button
              type="submit"
              id="save-name-btn"
              disabled={!userNameInput.trim()}
              className="bg-[#159FEF] hover:bg-[#0D7EBF] disabled:opacity-40 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </form>

        {/* Frequência de Pagamento */}
        <div className="pt-2 border-t border-[#E2E8F0] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#627D98]">
              Frequência de Recebimento
            </label>
            <span className="text-[11px] font-bold text-[#159FEF]">
              Altera o período do app
            </span>
          </div>

          <div className="space-y-2" role="radiogroup" aria-label="Alterar frequência de recebimento">
            {FREQUENCY_OPTIONS.map((opt) => {
              const isSelected = selectedFrequency === opt.id;
              const IconComp = opt.icon;

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  id={`settings-freq-${opt.id}`}
                  onClick={() => handleSelectFrequency(opt.id)}
                  className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left active:scale-[0.99] ${
                    isSelected
                      ? 'bg-[#F0F9FF] border-[#159FEF] ring-2 ring-[#159FEF]/20 shadow-2xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-[#159FEF] text-white' : 'bg-[#E2E8F0] text-[#627D98]'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#102A43]">{opt.title}</div>
                      <div className="text-[11px] text-[#627D98]">{opt.subtitle}</div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#159FEF] bg-[#159FEF]' : 'border-[#CBD5E1] bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#627D98] leading-tight pt-1">
            💡 Ao alterar a frequência, todos os resumos e limites se adaptam automaticamente e nenhum lançamento é apagado.
          </p>
        </div>
      </div>

      {/* Explicação de Privacidade e Armazenamento Local */}
      <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-[#059669]">
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>Seus dados ficam 100% neste dispositivo</span>
        </div>
        <p className="text-xs text-[#065F46] leading-relaxed">
          O <strong>pingowallet10</strong> funciona completamente offline, sem cadastros, senhas ou nuvem.
          Faça um backup regularmente para não perdê-los ao trocar de aparelho ou limpar o histórico do navegador.
        </p>
      </div>

      {/* Teto de Gastos do Período Bento Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
          <Target className="w-4 h-4 text-[#159FEF]" />
          <span>Teto de Gastos do Período</span>
        </div>
        <p className="text-xs text-[#627D98]">
          Defina um valor máximo que você planeja gastar por período ({selectedFrequency === 'weekly' ? 'Semanal' : selectedFrequency === 'biweekly' ? 'Quinzenal' : 'Mensal'}) para ajudar no seu controle financeiro.
        </p>

        <form onSubmit={handleSaveBudget} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#627D98]">
              R$
            </span>
            <input
              type="text"
              id="settings-budget-input"
              inputMode="decimal"
              placeholder="0,00 (Desativado)"
              value={rawBudget}
              onChange={(e) => setRawBudget(e.target.value)}
              className="w-full bg-[#F0F4F8] border border-[#E2E8F0] focus:border-[#159FEF] text-[#102A43] text-xs font-bold rounded-2xl pl-10 pr-3 py-2.5 outline-none"
            />
          </div>
          <button
            type="submit"
            id="save-budget-btn"
            className="bg-[#159FEF] hover:bg-[#0D7EBF] active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </form>
      </div>

      {/* 1 & 2. Backup e Restauração Offline Bento Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
          <Download className="w-4 h-4 text-[#159FEF]" />
          <span>Backup dos Seus Dados</span>
        </div>
        <p className="text-xs text-[#627D98] leading-relaxed">
          Baixe uma cópia completa dos seus lançamentos em formato JSON ou restaure um arquivo salvo anteriormente.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Exportar */}
          <button
            id="export-backup-btn"
            onClick={exportBackup}
            className="bg-[#F0F4F8] hover:bg-[#E2E8F0] border border-[#D9E2EC] text-[#102A43] font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-[#16A34A]" />
            <span>Exportar Dados</span>
          </button>

          {/* Importar */}
          <button
            id="import-backup-btn"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#F0F4F8] hover:bg-[#E2E8F0] border border-[#D9E2EC] text-[#102A43] font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 text-[#159FEF]" />
            <span>Importar Dados</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
        </div>

        {importError && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-xs text-[#DC2626] font-bold flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{importError}</span>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Importação de Backup */}
      {pendingBackupContent && pendingBackupStats && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-xl border border-[#E2E8F0] animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#102A43] font-bold text-sm">
                <FileText className="w-4 h-4 text-[#159FEF]" />
                <span>Confirmar Importação</span>
              </div>
              <button
                onClick={handleCancelImport}
                className="p-1 rounded-full text-[#627D98] hover:bg-[#F0F4F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-[#F0F4F8] rounded-2xl space-y-2 text-xs border border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <span className="text-[#627D98]">Lançamentos no arquivo:</span>
                <span className="font-bold text-[#102A43]">{pendingBackupStats.txCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#627D98]">Categorias no arquivo:</span>
                <span className="font-bold text-[#102A43]">{pendingBackupStats.catCount}</span>
              </div>
              {pendingBackupStats.exportDate && (
                <div className="flex items-center justify-between">
                  <span className="text-[#627D98]">Data do backup:</span>
                  <span className="font-mono text-[11px] text-[#102A43]">
                    {new Date(pendingBackupStats.exportDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl flex items-start gap-2 text-xs text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-tight">
                <strong>Atenção:</strong> A importação substituirá os dados atuais deste aparelho pelos dados contidos neste arquivo.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelImport}
                className="flex-1 bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#102A43] text-xs font-bold py-2.5 rounded-2xl border border-[#D9E2EC]"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-import-backup-btn"
                onClick={handleConfirmImport}
                className="flex-1 bg-[#159FEF] hover:bg-[#0D7EBF] active:scale-95 text-white text-xs font-bold py-2.5 rounded-2xl shadow-sm transition-all"
              >
                Substituir e Restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Apagar todos os meus dados (Zona de Perigo) Bento Card */}
      <div className="border border-[#FEE2E2] bg-[#FEF2F2] rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626]">
          <Trash2 className="w-4 h-4" />
          <span>Apagar todos os meus dados</span>
        </div>
        <p className="text-xs text-[#991B1B] leading-relaxed">
          Todos os seus lançamentos, categorias personalizadas e preferências serão permanentemente excluídos da memória deste navegador.
        </p>

        {!showResetConfirm ? (
          <button
            id="open-reset-confirm-btn"
            onClick={() => {
              setShowResetConfirm(true);
              setResetError(null);
            }}
            className="w-full bg-white hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] font-bold py-2.5 px-4 rounded-2xl text-xs transition-colors shadow-2xs"
          >
            Apagar todos os meus dados
          </button>
        ) : (
          <div className="p-3.5 bg-white border border-[#FECACA] rounded-2xl space-y-2.5 animate-in fade-in shadow-xs">
            <p className="text-xs font-bold text-[#DC2626]">
              Confirmação de segurança: Digite <strong>ZERAR</strong> abaixo para excluir todos os dados:
            </p>
            <input
              type="text"
              id="confirm-reset-input"
              value={resetCodeInput}
              onChange={(e) => {
                setResetCodeInput(e.target.value);
                setResetError(null);
              }}
              placeholder="Digite ZERAR"
              className="w-full bg-[#F0F4F8] border border-[#FECACA] text-[#102A43] text-xs font-bold rounded-xl px-3 py-2 outline-none uppercase"
            />
            {resetError && (
              <p className="text-[11px] font-bold text-[#DC2626]">{resetError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetCodeInput('');
                  setResetError(null);
                }}
                className="flex-1 bg-[#F0F4F8] text-[#102A43] text-xs font-bold py-2 rounded-xl border border-[#D9E2EC]"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-reset-action-btn"
                onClick={handleConfirmReset}
                className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs py-2 rounded-xl shadow-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sobre e Informações */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PingoMascot mood="happy" size={32} />
            <div>
              <h3 className="text-xs font-bold text-[#102A43]">pingowallet10 v1.0.0</h3>
              <p className="text-[10px] text-[#627D98]">Organize suas finanças antes de dormir</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#F5DFC5] text-[#102A43] border border-[#F5B82E]/30 font-bold px-2.5 py-0.5 rounded-full">
            Pago • R$ 30
          </span>
        </div>

        <div className="pt-2.5 border-t border-[#E2E8F0] space-y-2 text-xs text-[#627D98]">
          <div className="flex items-center justify-between">
            <span>Suporte por e-mail:</span>
            <a
              href="mailto:pingowallet10@gmail.com"
              className="text-[#159FEF] hover:underline font-bold"
            >
              pingowallet10@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

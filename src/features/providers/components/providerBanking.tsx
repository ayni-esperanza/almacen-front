import React from "react";
import { Check, ChevronRight, Landmark, Minus, Plus } from "lucide-react";
import { SearchableSelect } from "../../../shared/components/SearchableSelect";
import { Provider, ProviderBankAccount } from "../types";
import { ProviderBankAccountForm } from "../utils/validation";

export type ProviderModalTab = "general" | "banking";

export interface BankOption {
  label: string;
  value: string;
  shortLabel: string;
  accentClassName: string;
  iconSrc: string;
}

const publicAsset = (fileName: string) => `${import.meta.env.BASE_URL}${encodeURI(fileName)}`;

export const BANK_OPTIONS: BankOption[] = [
  { label: "BCP", value: "BCP", shortLabel: "BCP", accentClassName: "bg-blue-700 text-white", iconSrc: publicAsset("bcp.jpeg") },
  { label: "BBVA", value: "BBVA", shortLabel: "BBVA", accentClassName: "bg-sky-600 text-white", iconSrc: publicAsset("bbva.png") },
  { label: "Interbank", value: "Interbank", shortLabel: "IBK", accentClassName: "bg-lime-500 text-slate-900", iconSrc: publicAsset("interbank.jpeg") },
  { label: "Scotiabank", value: "Scotiabank", shortLabel: "S", accentClassName: "bg-red-600 text-white", iconSrc: publicAsset("scotiabank.jpeg") },
  { label: "Banco de la Nacion", value: "Banco de la Nacion", shortLabel: "BN", accentClassName: "bg-amber-400 text-slate-900", iconSrc: publicAsset("banco de la nacion.jpg") },
  { label: "Mi Banco", value: "Mi Banco", shortLabel: "Mi", accentClassName: "bg-emerald-500 text-white", iconSrc: publicAsset("mibanco.png") },
];

const getBankOption = (bankName?: string | null) =>
  BANK_OPTIONS.find((option) => option.value.toLowerCase() === (bankName || "").toLowerCase());

export const getProviderBankAccounts = (provider: Provider): ProviderBankAccount[] => {
  if (provider.bankAccounts?.length) return provider.bankAccounts;
  if (provider.banco || provider.cta || provider.cci) {
    return [
      {
        banco: provider.banco || "",
        cta: provider.cta || "",
        cci: provider.cci || "",
      },
    ];
  }
  return [];
};

export const BankLogo = ({
  bankName,
  className = "",
}: {
  bankName?: string | null;
  className?: string;
}) => {
  const option = getBankOption(bankName);

  if (!option) {
    return (
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 ${className}`}
      >
        <Landmark className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={option.iconSrc}
      alt=""
      className={`inline-flex h-8 w-8 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700 ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProviderModalTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: ProviderModalTab;
  onChange: (tab: ProviderModalTab) => void;
}) => {
  const tabs: Array<{ id: ProviderModalTab; label: string }> = [
    { id: "general", label: "Datos generales" },
    { id: "banking", label: "Cuentas bancarias" },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-purple-100 bg-purple-50/70 p-1.5 dark:border-purple-500/20 dark:bg-purple-500/10">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-white text-purple-700 shadow-sm dark:bg-slate-900 dark:text-purple-200"
                : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-900/60"
            }`}
          >
            <span>{tab.label}</span>
            {isActive && <ChevronRight className="h-4 w-4" />}
          </button>
        );
      })}
    </div>
  );
};

export const BankOptionLabel = ({ bankName }: { bankName: string }) => (
  <span className="flex items-center gap-2">
    <BankLogo bankName={bankName} className="h-7 w-7 rounded-lg text-[9px]" />
    <span>{bankName}</span>
  </span>
);

export const ProviderBankAccountsSection = ({
  bankAccounts,
  setBankAccounts,
  handleAddBankAccount,
  handleRemoveBankAccount,
  labelClasses,
}: {
  bankAccounts: ProviderBankAccountForm[];
  setBankAccounts: React.Dispatch<React.SetStateAction<ProviderBankAccountForm[]>>;
  handleAddBankAccount: () => void;
  handleRemoveBankAccount: (index: number) => void;
  labelClasses: string;
}) => (
  <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-3 dark:border-purple-500/30 dark:bg-purple-500/10">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Cuentas bancarias</p>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Agrega una o mas cuentas bancarias para este proveedor.
        </p>
      </div>
      <button
        type="button"
        onClick={handleAddBankAccount}
        disabled={bankAccounts.length >= 4}
        className={`inline-flex items-center gap-2 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-purple-700 ${
          bankAccounts.length >= 4 ? "cursor-not-allowed opacity-40 hover:bg-purple-600" : ""
        }`}
      >
        <Plus className="h-4 w-4" />
        Agregar cuenta
      </button>
    </div>

    <div className="grid gap-3">
      {bankAccounts.map((account, index) => (
        <div
          key={index}
          className="rounded-2xl border border-purple-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
              Cuenta {index + 1}
            </span>
            {bankAccounts.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveBankAccount(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/15"
                title="Eliminar cuenta"
              >
                <Minus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <span className={labelClasses}>Banco</span>
              <SearchableSelect
                value={account.banco}
                onChange={(value) => {
                  setBankAccounts((prev) =>
                    prev.map((item, idx) => (idx === index ? { ...item, banco: value } : item)),
                  );
                }}
                options={BANK_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.value,
                  iconSrc: option.iconSrc,
                }))}
                placeholder="Selecciona un banco"
              />
            </div>

            <label>
              <span className={labelClasses}>Cuenta</span>
              <input
                type="text"
                value={account.cta}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(0, 16);
                  setBankAccounts((prev) =>
                    prev.map((item, idx) => (idx === index ? { ...item, cta: value } : item)),
                  );
                }}
                maxLength={16}
                inputMode="numeric"
                pattern="\d{1,16}"
                className="h-10 w-full rounded-xl border border-gray-300 px-3 py-1.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-purple-300 dark:focus:ring-purple-500/30"
                placeholder="Numero de cuenta"
              />
            </label>

            <label>
              <span className={labelClasses}>CCI</span>
              <input
                type="text"
                value={account.cci}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(0, 20);
                  setBankAccounts((prev) =>
                    prev.map((item, idx) => (idx === index ? { ...item, cci: value } : item)),
                  );
                }}
                maxLength={20}
                inputMode="numeric"
                pattern="\d{1,20}"
                className="h-10 w-full rounded-xl border border-gray-300 px-3 py-1.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-purple-300 dark:focus:ring-purple-500/30"
                placeholder="Codigo de cuenta interbancario"
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CopyBadge = ({
  copied,
  onClick,
}: {
  copied: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10"
    title={copied ? "Copiado" : "Copiar"}
  >
    {copied ? <Check className="h-3.5 w-3.5" /> : <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2"><rect x="9" y="9" width="10" height="10" rx="2"/><path d="M5 15V7a2 2 0 0 1 2-2h8"/></svg>}
  </button>
);

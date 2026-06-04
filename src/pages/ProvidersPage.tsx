import React, { useState } from "react";
import {
  Plus,
  User,
  Phone,
  AlertCircle,
  Mail,
  Search,
  Copy,
  Check,
  Grid3X3,
  Table2,
  MapPin,
} from "lucide-react";
import { Provider } from "../features/providers/types";
import { AddProviderModal } from "../features/providers/components/AddProviderModal";
import { EditProviderModal } from "../features/providers/components/EditProviderModal";
import { useProviders } from "../features/providers/hooks/useProviders";
import { useToast } from "../shared/hooks/useToast";
import { Pagination } from "../shared/components/Pagination";
import { usePagination } from "../shared/hooks/usePagination";
import { ConfirmModal } from "../shared/components/ConfirmModal";
import { BANK_OPTIONS, BankLogo, getProviderBankAccounts } from "../features/providers/components/providerBanking";

const ProvidersPage = () => {
  const {
    providers,
    loading,
    error,
    refetch,
    createProvider,
    updateProvider,
    deleteProvider,
  } = useProviders();
  const [hasLoaded, setHasLoaded] = useState(false);
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [confirmState, setConfirmState] = useState<{ open: boolean; provider: Provider | null }>({
    open: false,
    provider: null,
  });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [providerCardTabs, setProviderCardTabs] = useState<Record<number, "info" | "banking">>({});
  const [providerBankFilters, setProviderBankFilters] = useState<Record<number, string>>({});

  React.useEffect(() => {
    if (!loading) {
      setHasLoaded(true);
    }
  }, [loading]);

  const searchInputClasses =
    "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:border-purple-500 text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-purple-400";

  // Usar useMemo para filtrar Y ORDENAR
  const filteredProviders = React.useMemo(() => {
    // Filtrar
    const filtered = providers.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.ruc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.banco || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.cta || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.cci || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.bankAccounts || []).some(
          (account) =>
            account.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.cta.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.cci.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Ordenar por fecha de creación (createdAt) descendente
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descendente: B - A
    });
  }, [providers, searchTerm]);

  const {
    paginatedData: paginatedProviders,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredProviders, initialItemsPerPage: 100 });



  // Función para abrir WhatsApp con el número
  const openWhatsApp = (phone: string) => {
    const sanitized = phone.replace(/\D/g, "");
    if (!sanitized) return;
    const url = `https://wa.me/${sanitized}`;
    window.open(url, "_blank");
  };

  const handleCopy = async (value: string, key: string) => {
    if (!value || value === "N.A") return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      addToast("Dato copiado", "success");
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1600);
    } catch (error) {
      addToast("No se pudo copiar el dato", "error");
      console.error("Error copying value:", error);
    }
  };

  const openEditModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setEditModalOpen(true);
  };

  const getProviderCardTab = (providerId: number) => providerCardTabs[providerId] ?? "info";

  const setProviderCardTab = (providerId: number, tab: "info" | "banking") => {
    setProviderCardTabs((prev) => ({ ...prev, [providerId]: tab }));
  };

  const setProviderBankFilter = (providerId: number, bank: string) => {
    setProviderBankFilters((prev) => ({ ...prev, [providerId]: bank }));
  };

  const formatTableAccountNumber = (value: string) => {
    if (value === "N.A" || value.length <= 8) return value;
    return `${value.slice(0, 8)}...`;
  };

  const handleAddProvider = async (newProvider: Omit<Provider, "id">) => {
    try {
      const result = await createProvider(newProvider);
      if (result) {
        addToast(`Proveedor "${newProvider.name}" creado exitosamente`, 'success');
        setIsModalOpen(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el proveedor';
      addToast(errorMessage, 'error');
      console.error("Error adding provider:", error);
    }
  };

  const handleEditProvider = async (updatedProvider: Provider) => {
    try {
      // Extraer solo los campos editables (sin id, createdAt, updatedAt)
      const { id, createdAt, updatedAt, deletedAt, ...providerData } =
        updatedProvider;
      const result = await updateProvider(id, providerData);
      if (result) {
        addToast(`Proveedor "${updatedProvider.name}" actualizado exitosamente`, 'success');
        setEditModalOpen(false);
        setSelectedProvider(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el proveedor';
      addToast(errorMessage, 'error');
      console.error("Error updating provider:", error);
    }
  };

  const handleDeleteProvider = async (provider: Provider) => {
    setConfirmState({ open: true, provider });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.provider) {
      setConfirmState({ open: false, provider: null });
      return;
    }

    try {
      setIsConfirmingDelete(true);
      const success = await deleteProvider(confirmState.provider.id);
      if (success) {
        addToast(`Proveedor "${confirmState.provider.name}" eliminado exitosamente`, "success");
        setEditModalOpen(false);
        setSelectedProvider(null);
        await refetch();
      } else {
        addToast("No se pudo eliminar el proveedor", "error");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el proveedor";
      addToast(errorMessage, "error");
      console.error("Error deleting provider:", error);
    } finally {
      setIsConfirmingDelete(false);
      setConfirmState({ open: false, provider: null });
    }
  };

  return (
    <>
      <AddProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProvider}
      />
      <EditProviderModal
        key={selectedProvider?.id ?? 'new'}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onEdit={handleEditProvider}
        onDelete={handleDeleteProvider}
      />
      {/* HEADER */}
      <div className="px-6 py-4 text-white shadow-sm bg-gradient-to-r from-purple-500 to-purple-600">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5" />
          <h2 className="text-xl font-bold">Gestión de Proveedores</h2>
        </div>
      </div>
      {/* Content Container */}
      <div className="flex flex-col bg-white border border-transparent shadow-lg dark:border-slate-800 dark:bg-slate-950">
        {loading && !hasLoaded ? (
          <div className="p-8 text-center bg-white dark:bg-slate-950">
            <div className="w-12 h-12 mx-auto border-b-2 border-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-slate-300">
              Cargando proveedores...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white dark:bg-slate-950">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="mb-4 text-red-600 dark:text-rose-300">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* FILTROS sticky */}
            <div className="sticky top-[109px] z-20 p-4 border-b border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-[28rem]">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, RUC, banco, cuenta o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={searchInputClasses}
              />
            </div>
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                    viewMode === "table"
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  title="Vista tabla"
                >
                  <Table2 className="h-4 w-4" />
                  <span className="sr-only">Tabla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                    viewMode === "grid"
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  title="Vista cuadrícula"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="sr-only">Cuadrícula</span>
                </button>
              </div>
            </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center flex-shrink-0 px-6 py-2 space-x-2 font-medium text-white transition-colors bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Proveedor</span>
              </button>
            </div>
          </div>

        {filteredProviders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
            <p>No se encontraron proveedores</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div
                key={`${currentPage}-${itemsPerPage}-${searchTerm}-grid`}
                className="grid gap-4 p-4 fade-section sm:grid-cols-2 xl:grid-cols-3"
              >
                {paginatedProviders.map((provider) => {
                  const activeCardTab = getProviderCardTab(provider.id);
                  const accounts = getProviderBankAccounts(provider);

                  return (
                    <article
                      key={provider.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-purple-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-purple-500/40"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(provider)}
                          className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-purple-200 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10"
                          title="Editar proveedor"
                        >
                          {provider.photoUrl ? (
                            <img src={provider.photoUrl} alt={provider.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-7 w-7 text-purple-500 dark:text-purple-300" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(provider)}
                            className="block max-w-full truncate text-left text-base font-semibold text-gray-900 hover:text-purple-700 dark:text-slate-100 dark:hover:text-purple-200"
                            title={provider.name}
                          >
                            {provider.name}
                          </button>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                            <span className="font-mono">{provider.ruc || "N.A"}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                            <span>{accounts.length} cuenta{accounts.length === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setProviderCardTab(provider.id, "info")}
                          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                            activeCardTab === "info"
                              ? "bg-white text-purple-700 shadow-sm dark:bg-slate-950 dark:text-purple-200"
                              : "text-gray-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-950/70"
                          }`}
                        >
                          Información
                        </button>
                        <button
                          type="button"
                          onClick={() => setProviderCardTab(provider.id, "banking")}
                          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                            activeCardTab === "banking"
                              ? "bg-white text-purple-700 shadow-sm dark:bg-slate-950 dark:text-purple-200"
                              : "text-gray-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-950/70"
                          }`}
                        >
                          Cuentas
                        </button>
                      </div>

                      {activeCardTab === "info" ? (
                        <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0 text-purple-500" />
                            <span className="truncate">{provider.email}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                            <span className="line-clamp-2">{provider.address || "N.A"}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {provider.phones.map((phone, idx) => (
                              <button
                                key={`${provider.id}-grid-phone-${idx}`}
                                type="button"
                                onClick={() => openWhatsApp(phone)}
                                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 transition-colors hover:bg-green-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                {phone}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {accounts.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-slate-400">Sin cuentas bancarias</p>
                          ) : (() => {
                            const availableBanks = Array.from(
                              new Set(accounts.map((account) => account.banco).filter(Boolean)),
                            );
                            const selectedBank = providerBankFilters[provider.id] ?? availableBanks[0] ?? "all";
                            const visibleAccounts =
                              selectedBank === "all"
                                ? accounts
                                : accounts.filter((account) => account.banco === selectedBank);

                            return (
                              <>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {availableBanks.map((bank) => {
                                    const bankOption = BANK_OPTIONS.find((option) => option.value === bank);
                                    return (
                                      <button
                                        key={`${provider.id}-bank-filter-${bank}`}
                                        type="button"
                                        onClick={() => setProviderBankFilter(provider.id, bank)}
                                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                                          selectedBank === bank
                                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200 dark:bg-purple-500/10 dark:ring-purple-500/30"
                                            : "border-gray-200 bg-white hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
                                        }`}
                                        title={bank}
                                      >
                                        {bankOption ? (
                                          <img
                                            src={bankOption.iconSrc}
                                            alt=""
                                            className="h-6 w-6 rounded-md object-contain"
                                          />
                                        ) : (
                                          <BankLogo bankName={bank} className="h-6 w-6 rounded-md" />
                                        )}
                                      </button>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() => setProviderBankFilter(provider.id, "all")}
                                    className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold transition-colors ${
                                      selectedBank === "all"
                                        ? "border-purple-500 bg-purple-600 text-white"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                                    }`}
                                    title="Mostrar todas las cuentas"
                                  >
                                    Todas
                                  </button>
                                </div>
                                {visibleAccounts.map((account, index) => (
                              <div
                                key={`${provider.id}-grid-account-${index}`}
                                className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-900/70"
                              >
                                <div className="mb-2 flex items-center gap-2">
                                  <BankLogo bankName={account.banco || "N.A"} />
                                  <span className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                                    {account.banco || "N.A"}
                                  </span>
                                </div>
                                {[
                                  { label: "CTA", value: account.cta || "N.A", key: `${provider.id}-grid-cta-${index}` },
                                  { label: "CCI", value: account.cci || "N.A", key: `${provider.id}-grid-cci-${index}` },
                                ].map((item) => {
                                  const copied = copiedKey === item.key;
                                  return (
                                    <div key={item.key} className="flex items-center justify-between gap-2 py-1 text-xs">
                                      <span className="font-semibold text-gray-500 dark:text-slate-400">{item.label}</span>
                                      <span className="flex min-w-0 items-center gap-1.5 font-mono text-gray-700 dark:text-slate-200">
                                        <span className="truncate">{item.value}</span>
                                        {item.value !== "N.A" && (
                                          <button
                                            type="button"
                                            onClick={() => handleCopy(item.value, item.key)}
                                            className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10"
                                            title={`Copiar ${item.label}`}
                                          >
                                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                          </button>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
            <div
              key={`${currentPage}-${itemsPerPage}-${searchTerm}`}
              className="overflow-x-auto fade-section"
            >
              <table className="w-full table-fixed text-sm text-gray-700 dark:text-slate-200">
                <colgroup>
                  <col className="w-[4%]" />
                  <col className="w-[12%]" />
                  <col className="w-[8%]" />
                  <col className="w-[13%]" />
                  <col className="w-[14%]" />
                  <col className="w-[17%]" />
                  <col className="w-[12%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                </colgroup>
                {/* HEADER DE TABLA */}
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Foto
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Nombre
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      RUC
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Teléfonos
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Email
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Dirección
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Banco
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      Cuenta
                    </th>
                    <th className="px-3 py-3 text-sm font-semibold text-left text-gray-700 shadow-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-300">
                      CCI
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm bg-white divide-y divide-gray-100 dark:divide-slate-800 dark:bg-slate-950">
                  {paginatedProviders.map((provider) => (
                    <tr
                      key={provider.id}
                      className="transition-colors border-b border-gray-100 hover:bg-purple-50 dark:border-slate-800 dark:hover:bg-slate-900/40"
                    >
                      <td
                        className="px-3 py-3 cursor-pointer"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        {provider.photoUrl ? (
                          <img
                            src={provider.photoUrl}
                            alt={provider.name}
                            className="object-cover border border-purple-400 rounded-full w-9 h-9"
                          />
                        ) : (
                          <User className="text-purple-400 w-7 h-7" />
                        )}
                      </td>
                      <td
                        className="px-3 py-3 font-medium text-gray-900 cursor-pointer dark:text-slate-200"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        {provider.name}
                      </td>
                      <td
                        className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        <span className="block truncate font-mono text-xs" title={provider.ruc || "N.A"}>
                          {provider.ruc || "N.A"}
                        </span>
                      </td>
                      <td
                        className="px-3 py-3 cursor-pointer"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        <div className="flex max-w-full flex-wrap gap-1.5">
                          {provider.phones.map((phone, idx) => (
                            <button
                              key={idx}
                              className="flex max-w-full items-center px-2 py-1 text-xs font-medium text-green-800 transition-colors bg-green-100 rounded-full hover:bg-green-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                              onClick={(event) => {
                                event.stopPropagation();
                                openWhatsApp(phone);
                              }}
                              type="button"
                              title={`Abrir WhatsApp de ${phone}`}
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              <span className="truncate">{phone}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                      <td
                        className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        <span className="inline-flex max-w-full items-center gap-1.5 px-2 py-1 text-xs font-medium text-purple-700 rounded-full bg-purple-50 dark:bg-purple-500/10 dark:text-purple-200">
                          <Mail className="w-4 h-4" />
                          <span className="truncate" title={provider.email}>{provider.email}</span>
                        </span>
                      </td>
                      <td
                        className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        <span className="block truncate" title={provider.address}>{provider.address}</span>
                      </td>
                      <td
                        className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        <div className="flex max-w-full flex-col gap-1">
                          {getProviderBankAccounts(provider).map((account, index) => (
                            <span key={`${account.banco}-${index}`} className="inline-flex min-w-0 items-center gap-2">
                              <BankLogo bankName={account.banco || "N.A"} className="h-7 w-7 flex-shrink-0 rounded-lg" />
                              <span className="truncate font-medium" title={account.banco || "N.A"}>{account.banco || "N.A"}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td
                        className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          {getProviderBankAccounts(provider).map((account, index) => {
                            const value = account.cta || "N.A";
                            const key = `${provider.id}-cta-${index}`;
                            const copied = copiedKey === key;
                            return (
                              <span key={key} className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs">
                                <span className="min-w-0 truncate" title={value}>{formatTableAccountNumber(value)}</span>
                                {value !== "N.A" && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleCopy(value, key);
                                    }}
                                    className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10"
                                    title="Copiar cuenta"
                                  >
                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td
                        className="px-3 py-3 text-gray-600 cursor-pointer dark:text-slate-300"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setEditModalOpen(true);
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          {getProviderBankAccounts(provider).map((account, index) => {
                            const value = account.cci || "N.A";
                            const key = `${provider.id}-cci-${index}`;
                            const copied = copiedKey === key;
                            return (
                              <span key={key} className="inline-flex max-w-full items-center gap-1.5 font-mono text-xs">
                                <span className="min-w-0 truncate" title={value}>{formatTableAccountNumber(value)}</span>
                                {value !== "N.A" && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleCopy(value, key);
                                    }}
                                    className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-purple-200 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10"
                                    title="Copiar CCI"
                                  >
                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmState.open}
        title="Eliminar proveedor"
        message={`¿Eliminar definitivamente al proveedor "${confirmState.provider?.name ?? ""}"?`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, provider: null })}
        isProcessing={isConfirmingDelete}
        destructive
      />
    </>
  );
};

export default ProvidersPage;

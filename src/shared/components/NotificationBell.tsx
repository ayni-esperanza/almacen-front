import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bell, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stockAlertsService } from '../../features/reports/services/stock-alerts.service';

type AlertSeverity = 'critical' | 'warning';

type AlertStatus = 'pending' | 'acknowledged';

export interface StockAlertNotification {
  id: string;
  productName: string;
  productCode?: string;
  currentStock: number;
  minimumStock: number;
  updatedAt: string;
  severity: AlertSeverity;
  status?: AlertStatus;
}

interface NotificationBellProps {
  alerts?: StockAlertNotification[];
  onOpenAlertsCenter?: () => void;
  alertsRoute?: string;
  onAcknowledge?: (id: string) => void;
}

const mockAlerts: StockAlertNotification[] = [
  {
    id: 'alert-1',
    productName: 'Cascos',
    productCode: 'OP2025',
    currentStock: 3,
    minimumStock: 5,
    updatedAt: '2025-10-03T17:00:00Z',
    severity: 'critical',
    status: 'pending',
  },
  {
    id: 'alert-2',
    productName: 'Guantes',
    productCode: 'AF2024',
    currentStock: 1,
    minimumStock: 20,
    updatedAt: '2025-10-03T17:00:00Z',
    severity: 'critical',
    status: 'pending',
  },
  {
    id: 'alert-3',
    productName: 'Mascarillas',
    productCode: 'MS2024',
    currentStock: 14,
    minimumStock: 20,
    updatedAt: '2025-10-01T10:30:00Z',
    severity: 'warning',
    status: 'pending',
  },
];

const severityConfig: Record<AlertSeverity, { badge: string; chip: string; border: string }> = {
  critical: {
    badge: 'bg-rose-500/20 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
    chip: 'border border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200',
    border: 'border-rose-200 dark:border-rose-500/30',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200',
    chip: 'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  alerts,
  onOpenAlertsCenter,
  alertsRoute = '/dashboard/reports?tab=stock-alerts',
  onAcknowledge,
}) => {
  const [open, setOpen] = useState(false);
  const [localAlerts, setLocalAlerts] = useState<StockAlertNotification[]>(() => alerts ?? mockAlerts);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (alerts) {
      setLocalAlerts(alerts);
    }
  }, [alerts]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const pendingAlerts = useMemo(
    () => localAlerts.filter(alert => (alert.status ?? 'pending') === 'pending'),
    [localAlerts],
  );

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  );

  const acknowledgeAlert = async (id: string) => {
    try {
      // Llamar al servicio para marcar como visto en el backend
      await stockAlertsService.markAlertAsViewed(id);
      
      // Actualizar el estado local
      setLocalAlerts(prev =>
        prev.map(alert =>
          alert.id === id
            ? {
                ...alert,
                status: 'acknowledged',
              }
            : alert,
        ),
      );
      onAcknowledge?.(id);
    } catch (error) {
      console.error('Error marking alert as viewed:', error);
      // Mostrar un mensaje de error al usuario si es necesario
    }
  };

  const alertsToDisplay = [...localAlerts].sort((a, b) => {
    const aPending = (a.status ?? 'pending') === 'pending';
    const bPending = (b.status ?? 'pending') === 'pending';
    if (aPending === bPending) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return aPending ? -1 : 1;
  });
  const pendingCount = pendingAlerts.length;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Ver alertas de stock"
      >
        <Bell className="h-5 w-5" />
        {pendingCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-[1.5rem] min-w-[1.5rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white shadow-sm">
            {pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide">Alertas Activas</p>
              <p className="text-[10px] text-emerald-100">
                {pendingCount === 0
                  ? 'No hay alertas pendientes'
                  : `${pendingCount} ${pendingCount === 1 ? 'alerta pendiente' : 'alertas pendientes'}`}
              </p>
            </div>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto bg-white px-3 py-2 dark:bg-slate-950">
            {alertsToDisplay.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                No hay alertas registradas.
              </div>
            ) : (
              alertsToDisplay.map(alert => {
                const severity = severityConfig[alert.severity];
                const isPending = (alert.status ?? 'pending') === 'pending';
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl bg-white px-3 py-2 shadow-sm transition dark:bg-slate-900 ${severity.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severity.badge}`}>
                          <AlertTriangle className="h-3 w-3" />
                          {alert.severity === 'critical' ? 'Crítico' : 'Advertencia'}
                        </span>
                        <h4 className="mt-1.5 text-xs font-semibold text-gray-900 dark:text-slate-100">
                          {alert.productName}
                          {alert.productCode && (
                            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                              {alert.productCode}
                            </span>
                          )}
                        </h4>
                        <p className="mt-1 text-[10px] text-gray-500 dark:text-slate-400">
                          Stock actual: <span className="font-medium text-gray-700 dark:text-slate-200">{alert.currentStock}</span> ·
                          mínimo requerido: <span className="font-medium text-gray-700 dark:text-slate-200">{alert.minimumStock}</span>
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                          Última actualización: {formatter.format(new Date(alert.updatedAt))}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800 ${severity.chip}`}
                          >
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Marcar como visto
                            </span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <Check className="h-3 w-3" /> Resuelta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (alertsRoute) {
                navigate(alertsRoute);
              }
              onOpenAlertsCenter?.();
              setOpen(false);
            }}
            className="flex w-full items-center justify-between bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Ver todas las alertas
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

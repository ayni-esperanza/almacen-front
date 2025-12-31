import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, Toast as ToastType } from '../hooks/useToast';

const ToastIcon: React.FC<{ type: ToastType['type'] }> = ({ type }) => {
  const iconClass = 'w-5 h-5';
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-emerald-500`} />;
    case 'error':
      return <AlertCircle className={`${iconClass} text-red-500`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-amber-500`} />;
    case 'info':
      return <Info className={`${iconClass} text-blue-500`} />;
  }
};

const toastStyles: Record<ToastType['type'], string> = {
  success: 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  error: 'bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30',
  warning: 'bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
  info: 'bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30',
};

const textStyles: Record<ToastType['type'], string> = {
  success: 'text-emerald-800 dark:text-emerald-200',
  error: 'text-red-800 dark:text-red-200',
  warning: 'text-amber-800 dark:text-amber-200',
  info: 'text-blue-800 dark:text-blue-200',
};

interface ToastItemProps {
  toast: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToast();

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-in slide-in-from-top-2 fade-in ${toastStyles[toast.type]}`}
      role="alert"
    >
      <ToastIcon type={toast.type} />
      <p className={`text-sm font-medium flex-1 ${textStyles[toast.type]}`}>
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className={`p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors`}
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

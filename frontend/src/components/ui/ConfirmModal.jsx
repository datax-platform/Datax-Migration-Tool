import React, { useEffect } from "react";
import { AlertTriangle, HelpCircle, CheckCircle2, X } from "lucide-react";

export function ConfirmModal({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro de que deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading && onCancel) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconWrap: "bg-rose-500/15 text-rose-600 border border-rose-200",
      confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconWrap: "bg-amber-500/15 text-amber-600 border border-amber-200",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    primary: {
      icon: HelpCircle,
      iconWrap: "bg-blue-500/15 text-[#024ad8] border border-blue-200",
      confirmBtn: "bg-[#024ad8] hover:bg-[#023bb0] text-white",
    },
    success: {
      icon: CheckCircle2,
      iconWrap: "bg-emerald-500/15 text-emerald-600 border border-emerald-200",
      confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  };

  const cfg = variantConfig[variant] || variantConfig.danger;
  const Icon = cfg.icon;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => {
        if (!loading && onCancel) onCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-[16px] max-w-md w-full border border-[#e8e8e8] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#e8e8e8] flex items-center justify-between bg-[#fbfbfb]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${cfg.iconWrap}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1a1a1a]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-1 text-[#636363] hover:text-[#1a1a1a] rounded-md hover:bg-[#ececec] transition-colors disabled:opacity-40"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 text-xs text-[#3d3d3d] leading-relaxed whitespace-pre-line">
          {message}
        </div>

        <div className="px-5 py-3 bg-[#f7f7f7] border-t border-[#e8e8e8] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-[#d4d4d4] bg-white text-[#3d3d3d] hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-[6px] transition-colors shadow-xs disabled:opacity-50 ${cfg.confirmBtn}`}
          >
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


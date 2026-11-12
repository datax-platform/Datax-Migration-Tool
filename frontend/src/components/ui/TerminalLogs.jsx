import React, { useRef, useEffect, useState } from "react";
import { Terminal, Trash2, Copy, Check } from "lucide-react";

export function TerminalLogs({ logs = [], onClear, title = "Live Process Terminal", height = "h-64" }) {
  const scrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = async () => {
    if (!logs || logs.length === 0) return;
    const text = logs
      .map((log) => (typeof log === "string" ? log : log?.message ?? JSON.stringify(log)))
      .join("\n");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("No se pudieron copiar los logs:", e);
    }
  };

  return (
    <div className="bg-[#1a1a1a] text-[#f7f7f7] rounded-[16px] border border-[#3d3d3d] overflow-hidden shadow-2xl flex flex-col my-4">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#292929] border-b border-[#3d3d3d]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#296ef9]" />
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-slate-300">
            {title}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium text-slate-300 hover:text-white hover:bg-[#3d3d3d] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="Copiar logs al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium text-slate-300 hover:text-rose-300 hover:bg-[#3d3d3d] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Limpiar logs de la consola"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>
      <div
        ref={scrollRef}
        className={`${height} overflow-y-auto p-4 font-mono text-xs space-y-1.5 leading-relaxed bg-[#111111]`}
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 italic">Esperando eventos y logs del proceso...</div>
        ) : (
          logs.map((log, index) => {
            const msg = typeof log === "string" ? log : log?.message || "";
            const isError = /fail|error|exception|traceback/i.test(msg);
            const isSuccess = /ok|success|exito|completado|ready/i.test(msg);
            const isWarn = /warning|warn|alerta/i.test(msg);

            let textColor = "text-slate-300";
            if (isError) textColor = "text-rose-400 font-medium";
            else if (isSuccess) textColor = "text-emerald-400";
            else if (isWarn) textColor = "text-amber-300";

            return (
              <div key={index} className={`flex items-start gap-2 ${textColor}`}>
                <span className="text-slate-600 select-none">&gt;</span>
                <span className="break-all whitespace-pre-wrap">{msg}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

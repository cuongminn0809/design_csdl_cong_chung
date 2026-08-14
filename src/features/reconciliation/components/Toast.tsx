import { createContext, useCallback, useContext, useRef, useState } from "react"

type ToastKind = "ok" | "error"

const ToastContext = createContext<(msg: string, kind?: ToastKind) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; kind: ToastKind } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const showToast = useCallback((msg: string, kind: ToastKind = "ok") => {
    setToast({ msg, kind })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[200] flex max-w-[90vw] -translate-x-1/2 items-center gap-2.5 rounded-[10px] bg-neutral-900 px-[18px] py-3 text-[13.5px] text-white shadow-popover">
          <span
            className="size-4 shrink-0 rounded-full"
            style={{ background: toast.kind === "ok" ? "#22c55e" : "#ef4444" }}
          />
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  )
}

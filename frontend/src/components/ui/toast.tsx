import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let addToast: ((message: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = "info") {
  addToast?.(message, type);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToast = (message, type = "info") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
    return () => {
      addToast = null;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-3 text-sm text-white shadow-lg",
            t.type === "success" && "bg-green-600",
            t.type === "error" && "bg-red-600",
            t.type === "info" && "bg-blue-600"
          )}
        >
          <span>{t.message}</span>
          <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

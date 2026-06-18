import React from "react";
import { cn } from "@/utils/cn";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "success" | "warning" | "destructive" }) {
  const variants = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)} {...props} />
  );
}

export function Spinner() {
  return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="py-12 text-center text-muted-foreground">{message}</div>;
}

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {action}
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("border-b bg-muted/50 px-4 py-3 text-left font-medium", className)}>{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-b px-4 py-3", className)}>{children}</td>;
}

export function orderStatusVariant(status: string): "default" | "success" | "warning" | "destructive" {
  if (status === "COMPLETED") return "success";
  if (status === "CONFIRMED") return "default";
  if (status === "PENDING") return "warning";
  return "destructive";
}

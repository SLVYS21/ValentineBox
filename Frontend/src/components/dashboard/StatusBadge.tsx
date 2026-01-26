import { cn } from "@/lib/utils";

type StatusType = "delivered" | "validated" | "pending" | "in_progress" | "completed";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  delivered: {
    label: "Livrée",
    className: "bg-status-success-bg text-status-success",
  },
  validated: {
    label: "Validé",
    className: "bg-status-info-bg text-status-info",
  },
  pending: {
    label: "En attente",
    className: "bg-status-pending-bg text-status-pending",
  },
  in_progress: {
    label: "En cours",
    className: "bg-status-info-bg text-status-info",
  },
  completed: {
    label: "Terminée",
    className: "bg-status-success-bg text-status-success",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}

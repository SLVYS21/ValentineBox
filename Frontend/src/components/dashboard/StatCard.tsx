import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  subtitleClassName?: string;
  icon: LucideIcon;
  iconClassName?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  subtitleClassName,
  icon: Icon,
  iconClassName 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-white shadow-box card-hover">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className={cn("text-xs", subtitleClassName || "text-muted-foreground")}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconClassName || "bg-secondary"
        )}>
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

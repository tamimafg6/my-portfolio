import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface FiltersProps {
  filters: FilterChip[];
  onClearAll?: () => void;
  className?: string;
}

const Filters = ({ filters, onClearAll, className }: FiltersProps) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground"
            onClick={filter.onRemove}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove filter</span>
          </Button>
        </Badge>
      ))}
      {onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};

export { Filters };
export type { FilterChip };


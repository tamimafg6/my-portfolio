import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export type SearchProps = React.InputHTMLAttributes<HTMLInputElement>

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input ref={ref} className={cn("pl-9", className)} {...props} />
      </div>
    );
  }
);
Search.displayName = "Search";

export { Search };


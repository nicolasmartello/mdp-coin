import * as React from "react";
import { cn } from "~~/lib/utils";

// shadcn/ui Card, trimmed to the parts the wallet uses (re-add CardHeader & co. with `shadcn add card`)
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", className)}
      {...props}
    />
  );
}

export { Card };

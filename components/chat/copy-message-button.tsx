"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CopyMessageButtonProps = {
  content: string;
  className?: string;
  variant?: "default" | "on-primary";
};

export function CopyMessageButton({
  content,
  className,
  variant = "default",
}: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const label = copied ? "Copied" : "Copy message";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              "size-6 shrink-0",
              variant === "on-primary" &&
                "text-primary-foreground/70 hover:bg-white/15 hover:text-primary-foreground",
              className,
            )}
            aria-label={label}
            onClick={() => void handleCopy()}
          />
        }
      >
        {copied ? (
          <Check className="size-3" aria-hidden />
        ) : (
          <Copy className="size-3" aria-hidden />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

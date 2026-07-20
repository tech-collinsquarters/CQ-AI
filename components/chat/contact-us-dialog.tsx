"use client";

import Image from "next/image";
import { Mail, MessageCircleQuestion, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CONTACT_URL = "https://collinsquarters.com";

export function ContactUsDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2 border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 hover:text-brand-gold"
          />
        }
      >
        <MessageCircleQuestion className="size-4" aria-hidden />
        Contact us
      </DialogTrigger>
      <DialogContent>
        <div className="flex justify-center pb-1">
          <Image
            src="/logo.png"
            alt="Collins Quarters"
            width={1500}
            height={376}
            className="h-8 w-auto"
          />
        </div>
        <DialogHeader>
          <DialogTitle>Talk to the firm</DialogTitle>
          <DialogDescription>
            This chat gives general legal information — for advice on your
            matter, a consultation, or anything outside this case, reach
            Collins Quarters directly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 text-sm">
          <a
            href="tel:+61411888504"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted"
          >
            <Phone className="size-4 text-brand-gold" aria-hidden />
            +61 411 888 504
          </a>
          <a
            href="mailto:info@collinsquarters.com"
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted"
          >
            <Mail className="size-4 text-brand-gold" aria-hidden />
            info@collinsquarters.com
          </a>
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" />}>
            Close
          </DialogClose>
          <Button
            type="button"
            className="gap-2"
            nativeButton={false}
            render={
              <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer" />
            }
          >
            Visit collinsquarters.com
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

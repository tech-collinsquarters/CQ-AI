import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { IntakeFormInput } from "@/validators/case";

const EXAMPLES = [
  "My landlord refuses to return my security deposit.",
  "I was terminated without notice.",
  "I need help reviewing a commercial contract.",
];

type DescriptionStepProps = {
  form: UseFormReturn<IntakeFormInput>;
};

export function DescriptionStep({ form }: DescriptionStepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Examples
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {EXAMPLES.map((example) => (
            <li key={example} className="leading-relaxed">
              &ldquo;{example}&rdquo;
            </li>
          ))}
        </ul>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={6}
                placeholder="Describe your legal issue in your own words…"
                className="min-h-36 resize-none text-base"
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              {field.value?.length ?? 0} / 1000 characters (minimum 20)
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

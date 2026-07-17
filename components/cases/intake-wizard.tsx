"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

import { CategoryStep } from "@/components/cases/category-card";
import { DescriptionStep } from "@/components/cases/description-step";
import { ProgressHeader } from "@/components/cases/progress-header";
import { SubcategorySelector } from "@/components/cases/subcategory-selector";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { isImmigrationCategory } from "@/constants/case-categories";
import { useCreateCase } from "@/hooks/use-cases";
import { getIntakeSteps, getStepQuestion, type IntakeStepId } from "@/lib/intake-steps";
import { cn } from "@/lib/utils";
import {
  intakeDescriptionSchema,
  intakeFormSchema,
  type IntakeFormInput,
} from "@/validators/case";
import type { CaseCategory, ImmigrationSubcategory } from "@prisma/client";

export function IntakeWizard() {
  const createCase = useCreateCase();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const form = useForm<IntakeFormInput>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      category: undefined,
      subcategory: null,
      description: "",
    },
    mode: "onChange",
  });

  const category = form.watch("category");
  const steps = useMemo(() => getIntakeSteps(category), [category]);
  const currentStep = steps[stepIndex] ?? steps[0];
  const isLastStep = stepIndex === steps.length - 1;
  const isFirstStep = stepIndex === 0;

  useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(Math.max(steps.length - 1, 0));
    }
  }, [stepIndex, steps.length]);

  async function validateCurrentStep() {
    if (currentStep === "category") {
      if (!category) {
        form.setError("category", {
          message: "Please select a legal matter type.",
        });
        return false;
      }
      return true;
    }

    if (currentStep === "subcategory") {
      const subcategory = form.getValues("subcategory");
      if (!subcategory) {
        form.setError("subcategory", {
          message: "Please select an immigration matter type.",
        });
        return false;
      }
      return true;
    }

    const result = intakeDescriptionSchema.safeParse(
      form.getValues("description"),
    );
    if (!result.success) {
      form.setError("description", {
        message: result.error.issues[0]?.message ?? "Invalid description",
      });
      return false;
    }

    return true;
  }

  async function goNext() {
    const valid = await validateCurrentStep();
    if (!valid) {
      return;
    }

    if (isLastStep) {
      const values = form.getValues();
      const parsed = intakeFormSchema.safeParse(values);
      if (!parsed.success) {
        return;
      }

      await createCase.mutateAsync({
        category: parsed.data.category,
        subcategory: parsed.data.subcategory ?? null,
        description: parsed.data.description,
      });
      return;
    }

    setDirection("forward");
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function goBack() {
    setDirection("back");
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  function handleCategorySelect(value: CaseCategory) {
    form.setValue("category", value, { shouldDirty: true, shouldValidate: true });
    form.clearErrors("category");

    if (!isImmigrationCategory(value)) {
      form.setValue("subcategory", null);
    }

    const nextSteps = getIntakeSteps(value);
    if (stepIndex >= nextSteps.length) {
      setStepIndex(nextSteps.length - 1);
    }
  }

  function handleSubcategorySelect(value: ImmigrationSubcategory) {
    form.setValue("subcategory", value, { shouldDirty: true, shouldValidate: true });
    form.clearErrors("subcategory");
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-2")}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="space-y-6">
          <div className="space-y-2">
            <CardTitle className="text-2xl">New case intake</CardTitle>
            <CardDescription className="text-base">
              Answer a few questions so we can set up your case workspace.
            </CardDescription>
          </div>
          <ProgressHeader currentStep={currentStep} category={category} />
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void goNext();
              }}
              className="space-y-8"
            >
              <div
                key={`${currentStep}-${stepIndex}`}
                className={cn(
                  "animate-in space-y-3 duration-300 fill-mode-both",
                  direction === "forward"
                    ? "fade-in-0 slide-in-from-right-4"
                    : "fade-in-0 slide-in-from-left-4",
                )}
              >
                <h2 className="text-lg font-medium text-foreground">
                  {getStepQuestion(currentStep)}
                </h2>

                {currentStep === "category" ? (
                  <div className="space-y-2">
                    <CategoryStep
                      selected={category}
                      onSelect={handleCategorySelect}
                    />
                    {form.formState.errors.category ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.category.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {currentStep === "subcategory" ? (
                  <div className="space-y-2">
                    <SubcategorySelector
                      selected={form.watch("subcategory")}
                      onSelect={handleSubcategorySelect}
                    />
                    {form.formState.errors.subcategory ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.subcategory.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {currentStep === "description" ? (
                  <DescriptionStep form={form} />
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={isFirstStep || createCase.isPending}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Previous
                </Button>

                <Button
                  type="submit"
                  disabled={createCase.isPending}
                  className="gap-2 sm:min-w-36"
                >
                  {createCase.isPending ? (
                    <>
                      <Spinner />
                      Creating…
                    </>
                  ) : isLastStep ? (
                    "Continue"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="size-4" aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

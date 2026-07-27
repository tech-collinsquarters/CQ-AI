export const OTHER_JURISDICTION = "OTHER" as const;

export const JURISDICTIONS: { value: string; label: string }[] = [
  { value: "England & Wales", label: "England & Wales" },
  { value: "Scotland", label: "Scotland" },
  { value: "Northern Ireland", label: "Northern Ireland" },
  { value: "Republic of Ireland", label: "Republic of Ireland" },
  { value: "United States", label: "United States" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Kenya", label: "Kenya" },
  { value: "South Africa", label: "South Africa" },
  { value: "Australia", label: "Australia" },
  { value: "Canada", label: "Canada" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "India", label: "India" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: OTHER_JURISDICTION, label: "Other - specify" },
];

/** True when a stored jurisdiction value isn't one of the curated options (i.e. free text). */
export function isCustomJurisdiction(value: string | null): boolean {
  if (!value) {
    return false;
  }
  return !JURISDICTIONS.some((j) => j.value === value);
}

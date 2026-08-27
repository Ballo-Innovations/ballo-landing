import { clsx, type ClassValue } from "clsx";

/**
 * Class-name joiner for the components ported from 21st.dev, which all call
 * `cn` from "@/lib/utils".
 *
 * clsx-only on purpose: `tailwind-merge` is not a dependency here, and these
 * components compose their own classes with the caller's override appended
 * last, so plain last-wins ordering is enough. Add tailwind-merge only if a
 * component ever needs real conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

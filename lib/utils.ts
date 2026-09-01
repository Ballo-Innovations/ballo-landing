import { clsx, type ClassValue } from "clsx";

/**
 * The shadcn `cn` helper, on clsx alone.
 *
 * Upstream pairs clsx with tailwind-merge so a caller's `px-6` beats a
 * component's own `px-4`. We don't have tailwind-merge and don't need it yet:
 * nothing here passes a class that collides with a default. If that changes,
 * add tailwind-merge and wrap the clsx call rather than working around it at
 * the call sites.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

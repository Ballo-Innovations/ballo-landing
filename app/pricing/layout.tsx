import type { ReactNode } from "react";

export default function PricingLayout({ children }: { children: ReactNode }) {
  return <div className="pricing-route">{children}</div>;
}

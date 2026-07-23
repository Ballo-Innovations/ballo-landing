import Image from "next/image";
import type { StaticImageData } from "next/image";

export type PricingStep = {
  id: number;
  title: string;
  image: StaticImageData;
  imageAlt: string;
};

type PricingStepsFlowProps = {
  steps: PricingStep[];
  arrowIds?: { right: string; left: string };
};

const MOBILE_ORDER = [1, 2, 3, 4];

export function PricingStepsFlow({
  steps,
  arrowIds = { right: "pr-arrowR", left: "pr-arrowL" },
}: PricingStepsFlowProps) {
  const byId = (id: number) => steps.find((s) => s.id === id)!;
  const mobileSteps = MOBILE_ORDER.map(byId);

  return (
    <>
      {/* Mobile: vertical journey — one step at a time, thumb-friendly */}
      <ol className="pricing-steps-mobile md:hidden">
        {mobileSteps.map((step, index) => (
          <li key={step.id} className="pricing-steps-mobile__item">
            {index > 0 && <span className="pricing-steps-mobile__connector" aria-hidden="true" />}
            <div className="pricing-steps-mobile__card">
              <span className="pricing-steps-mobile__index">{step.id}</span>
              <h3 className="pricing-steps-mobile__title">{step.title.replace(/^\d+\.\s*/, "")}</h3>
              <div className="pricing-steps-mobile__phone">
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  width={200}
                  height={408}
                  className="pricing-steps-mobile__screen"
                />
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Desktop: dual-phone loop diagram */}
      <div className="pricing-steps-desktop hidden md:block relative max-w-2xl mx-auto">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 560 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <marker id={arrowIds.right} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
              <polygon points="0,0 9,4.5 0,9" fill="#22d3ee" />
            </marker>
            <marker id={arrowIds.left} markerWidth="9" markerHeight="9" refX="1" refY="4.5" orient="auto-start-reverse">
              <polygon points="0,4.5 9,0 9,9" fill="#22d3ee" />
            </marker>
          </defs>
          <path
            d="M 140 148 L 420 148 A 30 30 0 0 1 450 178 L 450 342 A 30 30 0 0 1 420 372 L 140 372 A 30 30 0 0 1 110 342 L 110 178 A 30 30 0 0 1 140 148 Z"
            stroke="#22d3ee"
            strokeWidth="2.2"
          />
          <line x1="240" y1="148" x2="318" y2="148" stroke="#22d3ee" strokeWidth="2.2" markerEnd={`url(#${arrowIds.right})`} />
          <line x1="320" y1="372" x2="242" y2="372" stroke="#22d3ee" strokeWidth="2.2" markerEnd={`url(#${arrowIds.left})`} />
        </svg>

        <div className="relative z-1 grid grid-cols-[1fr_auto_auto_1fr] gap-x-4 gap-y-8 items-center">
          <p className="text-sm font-bold text-slate-700 text-right leading-tight">{byId(1).title}</p>
          <Image src={byId(1).image} alt={byId(1).imageAlt} width={140} height={286} className="object-contain" />
          <Image src={byId(2).image} alt={byId(2).imageAlt} width={140} height={286} className="object-contain" />
          <p className="text-sm font-bold text-slate-700 text-left leading-tight">{byId(2).title}</p>

          <p className="text-sm font-bold text-slate-700 text-right leading-tight">{byId(4).title}</p>
          <Image src={byId(4).image} alt={byId(4).imageAlt} width={140} height={286} className="object-contain" />
          <Image src={byId(3).image} alt={byId(3).imageAlt} width={140} height={286} className="object-contain" />
          <p className="text-sm font-bold text-slate-700 text-left leading-tight">{byId(3).title}</p>
        </div>
      </div>
    </>
  );
}

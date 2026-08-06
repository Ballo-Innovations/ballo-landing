"use client";

import React, { useState } from "react";
import Image, { type StaticImageData } from "next/image";

export type ProfessionalServiceItem = {
  title: string;
  subtitle: string;
  description: string;
  image: StaticImageData | string | null;
};

export function ProfessionalAccordion({
  services,
}: {
  services: ProfessionalServiceItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleService = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="prof-accordion-section">
      <div className="prof-accordion">
        {services.map((service, index) => {
          const isOpen = openIndex === index;
          const panelId = `prof-panel-${index}`;
          const triggerId = `prof-trigger-${index}`;
          return (
            <div
              key={`${service.title}-${index}`}
              className={`prof-accordion__item${isOpen ? " is-open" : ""}`}
            >
              <h2 className="prof-accordion__heading">
                <button
                  id={triggerId}
                  type="button"
                  className="prof-accordion__trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleService(index)}
                >
                  <span className="prof-accordion__thumb" aria-hidden="true">
                    {service.image ? (
                      <Image src={service.image} alt="" width={72} height={56} />
                    ) : null}
                  </span>
                  <span className="prof-accordion__titles">
                    <span className="prof-accordion__title">{service.title}</span>
                    <span className="prof-accordion__subtitle">{service.subtitle}</span>
                  </span>
                  <span className="prof-accordion__chevron" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
              </h2>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="prof-accordion__panel"
              >
                <div className="prof-accordion__panel-inner" inert={!isOpen ? true : undefined}>
                  <p className="prof-accordion__desc">{service.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

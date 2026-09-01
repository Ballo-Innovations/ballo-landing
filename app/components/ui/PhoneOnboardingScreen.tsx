"use client";

import * as React from "react";
import Image from "next/image";
import { CloudUpload } from "lucide-react";

import logoIcon from "@/public/BalloAds Logo New/BalloAds-Icon.png";

/**
 * The app's first-run screen, as it appears on the phone mockup.
 *
 * Extracted from HomeClient so the hero and the "What We're About" section
 * render one screen rather than two copies that drift apart. Everything is
 * sized in `cqw` against the screen container (see `.phone-ui` in home.css),
 * so it holds its proportions at any phone size.
 *
 * `nextRef` is the whole reason this takes a ref at all: the hero's zoom-out
 * closes onto the Next button's real rect, so something has to be able to
 * measure it.
 */
export function PhoneOnboardingScreen({
  nextRef,
}: {
  nextRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <div className="phone-ui">
      <div className="phone-ui-head">
        <Image
          src={logoIcon}
          alt="BalloAds Logo"
          width={112}
          height={112}
          className="phone-ui-logo"
        />
        <h3 className="phone-ui-tagline">
          Your Digital Marketing
          <br />
          Assistant
        </h3>
      </div>

      <div className="phone-ui-upload">
        <CloudUpload className="phone-ui-cloud" strokeWidth={1.75} />
        <span className="phone-ui-upload-text">
          Upload your
          <br />
          artwork here
        </span>
      </div>

      <button ref={nextRef} type="button" className="phone-ui-next">
        Next
      </button>
    </div>
  );
}

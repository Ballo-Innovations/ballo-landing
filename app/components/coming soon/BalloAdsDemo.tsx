"use client";

import "./style.css";

import background from "@/public/Backgrounds/hero-bg.png";
import playStore from "@/public/elements small/18.png";
import appleStore from "@/public/elements small/19.png";

import balloAdsPhone from "@/public/elements small/phone.png";
import appIcon from "@/public/Ballo Logo New/App icon 1.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useWaitlist } from "../waitlist/WaitlistProvider";

const BalloAdsDemo = () => {
  const [revealPhone, setRevealPhone] = useState(false);
  const { openWaitlist } = useWaitlist();
  const { inView, ref } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      setRevealPhone(true);
    }
  }, [inView]);

  return (
    <section
      id="balloAds"
      className="min-h-screen text-white py-8 sm:py-14 relative px-4 sm:px-6 flex flex-col md:justify-center"
      style={{ background: `url(${background.src})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="flex flex-center flex-col md:flex-row md:items-center md:justify-center md:px-10 gap-6 sm:gap-10 md:gap-12 mx-auto w-full">
        <div className="flex justify-center items-center md:items-center flex-col text-center gap-6 sm:gap-10 w-full md:w-1/2">
          <Image src={appIcon} alt="Ballo Ads" quality={100} className="w-20 sm:w-24 md:w-28" />
          <h2 className="glitch-text subheading mb-5 leading-[1.1em] text-4xl lg:text-[4.5em] md:text-left px-2 sm:px-0">
            Advertise your brand in only a few seconds.
          </h2>
          <button
            type="button"
            onClick={openWaitlist}
            className="hidden md:block rounded-full px-8 md:px-12 py-2 md:py-3 bg-[var(--brand-color-4)] text-[var(--brand-color-1)] font-semibold text-xl md:text-2xl hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            Join waitlist
          </button>
        </div>

        <div
          className={`relative w-full flex-center md:w-1/2 mx-auto ${
            revealPhone ? "reveal-phone" : ""
          }`}
        >
          <Image
            ref={ref}
            src={balloAdsPhone}
            alt="Ballo Ads"
            quality={100}
            className="w-full opacity-100"
            id="phone"
          />

          {/* TODO(backend/assets): real App Store URL to be provided. */}
          <Link href="#" className="cursor-pointer">
            <Image
              src={appleStore}
              alt="Available on Apple Store"
              quality={100}
              className="mobile-app-1 opacity-100 absolute top-[48%] left-[10%] w-1/4 sm:w-1/3 rounded-xl"
            />
          </Link>

          {/* TODO(backend/assets): real Play Store URL to be provided. */}
          <Link href="#" className="cursor-pointer">
            <Image
              src={playStore}
              alt="Available on Paly Store"
              quality={100}
              className="mobile-app-2 opacity-100 absolute top-[62%] left-[10%] w-1/4 sm:w-1/3 rounded-xl"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={openWaitlist}
          className="block mt-5 md:hidden rounded-full px-8 sm:px-12 py-2.5 sm:py-5 bg-[var(--brand-color-4)] text-[var(--brand-color-1)] font-semibold text-xl sm:text-2xl md:text-3xl hover:scale-105 transition-transform duration-200 cursor-pointer w-full sm:w-auto"
        >
          Join waitlist
        </button>
      </div>
    </section>
  );
};

export default BalloAdsDemo;

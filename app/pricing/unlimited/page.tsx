"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Check, X, MessageSquare, Mail, Phone, MessageCircle } from "lucide-react";
import { PricingStepsFlow, type PricingStep } from "@/app/components/pricing/PricingStepsFlow";
import { PricingHeroToggle } from "@/app/components/pricing/PricingHeroToggle";

import bg from "@/public/BalloAds Assets 2/1.png";
import step1 from "@/public/Assets/45.png";
import step2 from "@/public/Assets/39.png";
import step3 from "@/public/Assets/38.png";
import step4 from "@/public/Assets/40.png";
import ring from "@/public/Assets/9.png";
import woman from "@/public/BalloAds Assets 2/25.png"

// --- TYPESCRIPT INTERFACES ---

interface Feature {
  text: string;
  included: boolean;
}

interface PricingTier {
    id: string;
    title: string;
    currency: string;
    icon: React.ReactNode;
    features: Feature[];
  }
  
  // --- DATA ---
  
  const pricingData: PricingTier[] = [
    {
      id: 'sms', title: 'SMS', currency: 'K', icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      features: [
        { text: 'Quick action tools and scheduling', included: true },
        { text: 'Analytics and campaign data', included: true },
        { text: 'Generative AI for quick content', included: true },
        { text: 'Unlimited sms expiry', included: true },
      ],
    },
    {
      id: 'email', title: 'Email', currency: 'K', icon: <Mail className="w-6 h-6 text-blue-400" />,
      features: [
        { text: 'Quick action tools and scheduling', included: true },
        { text: 'Analytics and campaign data', included: true },
        { text: 'AI Agent for automations', included: true },
        { text: 'Unlimited email expiry', included: true },
      ],
    },
    {
      id: 'whatsapp', title: 'WhatsApp', currency: 'K', icon: <MessageCircle className="w-6 h-6 text-green-500" />,
      features: [
        { text: 'Quick action tools and scheduling', included: true },
        { text: 'Analytics and campaign data', included: true },
        { text: 'Email and Push Notification support', included: true },
        { text: 'Unlimited WhatsApp expiry', included: true },
      ],
    },
  ];
  
  // --- HELPER FUNCTION FOR PRICING ---
  const calculatePrice = (messages: number): number => {
    const baseMessages = 1000;
    const basePrice = 0.400;
    const ratePerUnit = -0.034;
    const messagesPerRate = 1000;
  
    if (messages <= baseMessages) { return basePrice; }
  
    const excessMessages = messages - baseMessages;
    const priceIncrease = Math.ceil(excessMessages / messagesPerRate) * ratePerUnit;
    
    return basePrice + priceIncrease;
  };
  
  
  // --- REUSABLE COMPONENTS ---
  
  interface PricingCardProps {
    tier: PricingTier;
    initialMessages: number;
    maxMessages: number; 
  }
  
  const PricingCard: React.FC<PricingCardProps> = ({ tier, initialMessages, maxMessages = 10000 }) => {
    const [selectedMessages, setSelectedMessages] = useState(initialMessages);
  
    const calculatedPrice = useMemo(() => {
      return calculatePrice(selectedMessages);
    }, [selectedMessages]);
  
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedMessages(parseInt(event.target.value));
    };
  
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden h-full">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-900" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-slate-800">{tier.title}</h3>
          {tier.icon}
        </div>
  
        <div className="mb-6">
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {tier.currency}{calculatedPrice} <span className="text-sm text-slate-500 font-normal">per month</span>
          </div>
          
          {/* FUNCTIONAL SLIDER INPUT */}
          <div className="relative mt-3">
              <input
                  type="range"
                  min={initialMessages}
                  max={maxMessages}
                  step={250}
                  value={selectedMessages}
                  onChange={handleSliderChange}
                  className="w-full h-2 appearance-none bg-transparent cursor-pointer range-lg [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-900 [&::-webkit-slider-thumb]:shadow-lg"
              />
          </div>
  
          <div className="text-xs font-semibold text-slate-500 mt-2">
            Messages: {selectedMessages.toLocaleString()} +
          </div>
        </div>
  
        <button type="button" className="pricing-card__cta w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors mb-8">
          Sign Up
        </button>
  
        <div className="space-y-3 flex-grow border-t pt-6 border-slate-100">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              {feature.included ? (
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="text-slate-600">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
// Assume you are defining this component in a file like PricingAndSteps.tsx
export default function PricingAndSteps() {
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#DFE0E1";
    return () => { document.body.style.background = prev; };
  }, []);

  const stepsFlow: PricingStep[] = [
    { id: 1, title: "1. Easy Registration", image: step1, imageAlt: "Easy Registration" },
    { id: 2, title: "2. Purchase a package", image: step2, imageAlt: "Purchase a package" },
    { id: 3, title: "3. Run your campaign", image: step4, imageAlt: "Run your campaign" },
    { id: 4, title: "4. View Analytics", image: step3, imageAlt: "View Analytics" },
  ];

  return (
    <main className="pricing-page font-sans">

      <section className="pricing-hero">
        <div className="pricing-hero__card">
          <Image src={bg} alt="" fill className="object-cover object-center opacity-50" priority />
          <div className="absolute inset-0 bg-linear-to-b from-[#0a1220]/15 via-[#0a1220]/50 to-[#0a1220]/92" />

          <div className="pricing-hero__card-inner">
            <h1 className="pricing-hero__title">Dynamic, Transparent Pricing</h1>
            <PricingHeroToggle />
          </div>
        </div>

        <div className="pricing-cards">
          <div className="pricing-cards__grid">
            {pricingData.map((tier) => (
              <PricingCard key={tier.id} tier={tier} initialMessages={1250} maxMessages={10000} />
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-steps">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="pricing-steps__heading">Drive more growth in just 4 easy steps</h2>
          <PricingStepsFlow steps={stepsFlow} arrowIds={{ right: "pru-arrowR", left: "pru-arrowL" }} />
        </div>
      </section>

      <section className="pricing-cta">
        <div className="pricing-cta__inner">
          <div className="pricing-cta__copy">
            <h2 className="pricing-cta__title">
              Run your campaign
              <br />
              in just a few seconds
            </h2>
            <p className="pricing-cta__text">
              After registration, utilise our automations and run your dynamic campaigns in just a few clicks.
            </p>
            <button type="button" className="pricing-cta__btn">
              Download now
            </button>
          </div>

          <div className="pricing-cta__visual">
            <Image src={ring} alt="" aria-hidden="true" width={320} height={320} className="pricing-cta__ring" />
            <Image
              src={woman}
              alt="BalloAds user on mobile"
              width={280}
              height={300}
              className="pricing-cta__person"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
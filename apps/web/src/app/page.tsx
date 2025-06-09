"use client";

import AboutSection from "@/components/landingPageComponents/AboutSection";
import ContactSection from "@/components/landingPageComponents/ContactSection";
import FaqSection from "@/components/landingPageComponents/FaqSection";
import FeatureSection from "@/components/landingPageComponents/FeatureSection";
import FinalCtaSection from "@/components/landingPageComponents/FinalCtaSection";
import FooterSection from "@/components/landingPageComponents/FooterSection";
import Header from "@/components/landingPageComponents/Header";
import HeroSection from "@/components/landingPageComponents/HeroSection";
import PricingSection from "@/components/landingPageComponents/PricingSection";
import Testimonials from "@/components/landingPageComponents/Testimonials";
import { useEffect, useState } from "react";

export default function CyberpunkDesign() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      </div>

      {/* Floating Orbs */}
      <div
        className="absolute top-20 left-20 w-32 h-32 bg-purple-500/30 rounded-full blur-xl animate-bounce"
        style={{ animationDelay: "0s", animationDuration: "3s" }}
      />
      <div
        className="absolute top-40 right-32 w-24 h-24 bg-cyan-500/30 rounded-full blur-xl animate-bounce"
        style={{ animationDelay: "1s", animationDuration: "4s" }}
      />
      <div
        className="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-xl animate-bounce"
        style={{ animationDelay: "2s", animationDuration: "5s" }}
      />

      <div className="relative z-10">
        <Header />

        <HeroSection />

        <FeatureSection />

        <PricingSection />

        <Testimonials />
        <AboutSection />

        <FaqSection />
        <ContactSection />
        <FinalCtaSection />
        <FooterSection />
      </div>
    </div>
  );
}

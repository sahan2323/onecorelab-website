import { Hero } from "@/components/sections/hero";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { SelectedWork } from "@/components/sections/selected-work";
import { Process } from "@/components/sections/process";
import { Technology } from "@/components/sections/technology";
import { HomeInquiry } from "@/components/sections/home-inquiry";
import { AboutTeaser } from "@/components/sections/about-teaser";
import { Cta } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <SelectedWork />
      <Process />
      <Technology />
      <HomeInquiry />
      <AboutTeaser />
      <Cta />
    </>
  );
}

import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WorkInAction } from "@/components/marketing/WorkInAction";
import { WorkforcePreview } from "@/components/marketing/WorkforcePreview";
import { WorkAnywhere } from "@/components/marketing/WorkAnywhere";
import { TrustSection } from "@/components/marketing/TrustSection";
import { FinalCta } from "@/components/marketing/FinalCta";
import { PartnersMarquee } from "@/components/marketing/PartnersMarquee";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { AmbientBackground } from "@/components/marketing/AmbientBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <AmbientBackground />
      <MarketingNav />
      <main>
        <Hero />
        <HowItWorks />
        <WorkInAction />
        <WorkforcePreview />
        <WorkAnywhere />
        <TrustSection />
        <FinalCta />
        <PartnersMarquee />
      </main>
      <MarketingFooter />
    </div>
  );
}

import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WorkforcePreview } from "@/components/marketing/WorkforcePreview";
import { TrustSection } from "@/components/marketing/TrustSection";
import { FinalCta } from "@/components/marketing/FinalCta";
import { PartnersMarquee } from "@/components/marketing/PartnersMarquee";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <MarketingNav />
      <main>
        <Hero />
        <HowItWorks />
        <WorkforcePreview />
        <TrustSection />
        <FinalCta />
        <PartnersMarquee />
      </main>
      <MarketingFooter />
    </div>
  );
}

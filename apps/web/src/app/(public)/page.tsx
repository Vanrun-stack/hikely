import type { Metadata } from 'next';
import { HeroSection } from '@/components/hike/HeroSection';
import { FeaturedHikes } from '@/components/hike/FeaturedHikes';
import { StatsSection } from '@/components/hike/StatsSection';
import { HowItWorks } from '@/components/hike/HowItWorks';
import { RegionsGrid } from '@/components/hike/RegionsGrid';
import { CommunitySection } from '@/components/hike/CommunitySection';
import { CtaSection } from '@/components/hike/CtaSection';

export const metadata: Metadata = {
  title: 'Hikely — Découvrez les plus belles randonnées',
  description:
    'Plateforme collaborative de randonnée. Trouvez votre prochaine aventure parmi des milliers de tracés GPX vérifiés, notés et commentés par la communauté.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturedHikes />
      <RegionsGrid />
      <HowItWorks />
      <CommunitySection />
      <CtaSection />
    </>
  );
}

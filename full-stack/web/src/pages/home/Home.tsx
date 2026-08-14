import { HeroSlider } from './HeroSlider';
import { QuickAccess } from './QuickAccess';
import { NoticesSection } from './NoticesSection';
import { NewsEvents } from './NewsEvents';
import { AboutSection } from './AboutSection';
import { DepartmentsSection } from './DepartmentsSection';
import { StatsSection } from './StatsSection';
import { DirectorMessage } from './DirectorMessage';
import { UpcomingEvents } from './UpcomingEvents';
import { GallerySection } from './GallerySection';
import { ServicesSection } from './ServicesSection';

export default function Home() {
  return (
    <>
      <HeroSlider />
      <QuickAccess />
      <NoticesSection />
      <NewsEvents />
      <AboutSection />
      <DepartmentsSection />
      <StatsSection />
      <DirectorMessage />
      <UpcomingEvents />
      <GallerySection />
      <ServicesSection />
    </>
  );
}

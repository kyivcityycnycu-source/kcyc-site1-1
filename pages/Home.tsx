import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { PrinciplesSection } from '../components/PrinciplesSection';
import { ContactsSection } from '../components/ContactsSection';
import { HomeValues } from '../components/HomeValues';
import { StatsBanner } from '../components/StatsBanner';
import { MissionSection } from '../components/MissionSection';
import { ProjectsSection } from '../components/ProjectsSection';
import { JoinUsSection } from '../components/JoinUsSection';
import { scrollToSection } from '../lib/scroll';

export const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = params.get('scroll');
    if (scrollTarget) {
      // Small delay to ensure the DOM is fully ready
      setTimeout(() => {
        scrollToSection(scrollTarget);
      }, 100);
    }
  }, [location.search]);

  return (
    <>
      <HeroSection />
      <StatsBanner />
      <MissionSection />
      <HomeValues />
      <PrinciplesSection />
      <JoinUsSection />
      <ProjectsSection limit={3} isHome />
      <ContactsSection />
    </>
  );
};
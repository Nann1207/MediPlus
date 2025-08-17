import React from 'react';
import HeroSection from '@/components/HeroSection';
import FeatureCards from '@/components/FeatureCards';
import LocalPrograms from '@/components/LocalPrograms';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeatureCards />
        <LocalPrograms />
      </main>
    </div>
  );
};

export default Index;

import React from 'react';
import HeroSection from '../components/HeroSection';
import Header from '../components/Header';
import FlowSection from '../components/FlowSection';
import MethodSection from '../components/Method';
import ManifestoSection from '../components/Manifiesto'
import FooterSection from '../components/Foter'

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <ManifestoSection />
      <MethodSection />
      <FlowSection />
      <FooterSection />
    </>
  );
};

export default Home;
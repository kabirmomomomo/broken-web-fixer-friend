
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import WorkShowcase from '../components/WorkShowcase';
import Process from '../components/Process';
import Marquee from '../components/Marquee';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import LoadingAnimation from '../components/LoadingAnimation';
import { initScrollEffects } from '../utils/scroll';
import DigitalMenuShowcase from '@/components/DigitalMenuShowcase';
import TestimonialSection from './TestimonialSection';

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    // Initialize scroll effects after loading
    if (!loading) {
      initScrollEffects();
    }
    
    // Change page title
    document.title = "EasyMenu — Design Studio";
    
    // Smooth scrolling for anchor links
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 0);
        }
      }
    };
    
    // Check if there's a hash in URL on initial load
    if (window.location.hash) {
      handleHashChange();
    }
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearTimeout(timer);
    };
  }, [loading]);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <WorkShowcase />
      {/* <Marquee /> */}
      <DigitalMenuShowcase/>
      <TestimonialSection/>
      <Process />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;

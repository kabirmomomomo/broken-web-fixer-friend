import { useEffect, useRef } from 'react';
import { Sparkle, ShieldCheck, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = sectionRef.current;
    const elements = section?.querySelectorAll('.reveal');

    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="snap-start pt-16 md:pt-20 pb-24 md:pb-32 bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full -z-10"></div>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            About Us
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-300">
            We’re on a mission to make dining seamless, smart, and stunning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            icon: <Sparkle className="w-10 h-10 text-blue-400 mb-4" />,
            title: "Effortless Experience",
            text: "Scan, browse, and order without the hassle. No apps, no delays—just elegant simplicity."
          }, {
            icon: <Smartphone className="w-10 h-10 text-purple-400 mb-4" />,
            title: "Built for Restaurants",
            text: "A complete digital platform to increase sales, speed, and satisfaction—starting with your menu."
          }, {
            icon: <ShieldCheck className="w-10 h-10 text-indigo-400 mb-4" />,
            title: "No Hardware Needed",
            text: "No POS replacements or terminals. We work with what you already have—just smarter."
          }].map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md hover:scale-[1.02] transition-all"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              {card.icon}
              <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
              <p className="text-gray-300 text-sm">{card.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-lg md:text-xl text-gray-400 mb-4">
            From stylish QR code interfaces to full-service order management, EasyMenu is crafted for the modern diner and smart restaurateur alike.
          </p>
          <p className="text-md text-gray-500">
            Say goodbye to clunky menus and hello to an interactive, intuitive experience—no downloads, no friction.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;

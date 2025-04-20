import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkle, Users, TrendingUp, FileEdit } from 'lucide-react';

const processSteps = [
  {
    number: "01",
    icon: <Sparkle className="w-8 h-8 text-blue-400" />,
    title: "Enhancing Customer Experience",
    description:
      "Working with a digital menu is easier. Menu loads faster and provides more useful info at a glance."
  },
  {
    number: "02",
    icon: <Users className="w-8 h-8 text-purple-400" />,
    title: "Attracting New Customers",
    description:
      "Guests leave reviews straight from the QR code menu. More positive reviews attract more new guests."
  },
  {
    number: "03",
    icon: <TrendingUp className="w-8 h-8 text-green-400" />,
    title: "Increasing Sales",
    description:
      "Mouth-watering photos and effortless ordering drive more impulse decisions and higher average checks."
  },
  {
    number: "04",
    icon: <FileEdit className="w-8 h-8 text-indigo-400" />,
    title: "Saving Resources",
    description:
      "Easy-to-edit QR menus reduce time and money spent updating physical menus, increasing relevance."
  }
];

const Process = () => {
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
      id="process"
      ref={sectionRef}
      className="snap-start py-24 md:py-32 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Our Process
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-300">
            Discover how our digital menu transforms every aspect of dining.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.number}
              className="group transform transition hover:scale-[1.02] bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-sm text-gray-400 font-mono">{step.number}</div>
                <div className="flex items-center gap-2">
                  {step.icon}
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;

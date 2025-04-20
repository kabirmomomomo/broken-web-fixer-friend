import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, ArrowUpRight } from 'lucide-react';

const Contact = () => {
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
      id="contact"
      ref={sectionRef}
      className="snap-start py-24 md:py-32 bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/20 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg md:text-xl text-gray-300">
            Let's build something extraordinary. Reach out, collaborate, and explore what we can do together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            className="flex items-start space-x-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="mt-1">
              <Mail className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Email Us</h3>
              <a
                href="mailto:EasyMenu@gmail.com"
                className="text-lg text-gray-300 hover:text-blue-400 transition flex items-center group"
              >
                EasyMenu@gmail.com
                <ArrowUpRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start space-x-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="mt-1">
              <MapPin className="text-purple-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Visit Us</h3>
              <p className="text-lg text-gray-300">
                Gera World of Joy<br />
                Pune
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

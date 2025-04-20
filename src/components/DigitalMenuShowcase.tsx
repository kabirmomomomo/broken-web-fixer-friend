import { useEffect, useRef } from "react";
import { Smartphone, MenuSquare } from "lucide-react";
import { motion } from "framer-motion";

const DigitalMenuPreview = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = sectionRef.current;
    const elements = section?.querySelectorAll(".reveal");

    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="digital-menu"
      className="snap-start py-24 md:py-32 bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-40 h-40 bg-purple-400/20 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-12 relative z-10">
        <motion.a
          href="http://localhost:8080/menu-preview/79ca4367-867e-4cec-b00d-a9a298f7b035"
          target="_blank"
          rel="noopener noreferrer"
          className="group transform transition hover:scale-105 hover:shadow-[0_0_30px_5px_rgba(147,197,253,0.1)]"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-[300px] h-[600px] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[2rem] p-4 shadow-lg border border-gray-700 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-xl z-10" />
            <div className="bg-white rounded-xl p-4 mt-10 mb-6 overflow-hidden">
              <h3 className="text-gray-800 font-bold text-lg mb-2">Today's Menu</h3>
              <ul className="space-y-2">
                <li className="p-2 rounded-lg bg-gray-100 text-gray-800 shadow-sm hover:bg-blue-50 transition">
                  🥗 Caesar Salad - <span className="text-sm text-gray-500">Fresh & crispy</span>
                </li>
                <li className="p-2 rounded-lg bg-gray-100 text-gray-800 shadow-sm hover:bg-purple-50 transition">
                  🍝 Pasta Arrabiata - <span className="text-sm text-gray-500">Spicy & tangy</span>
                </li>
                <li className="p-2 rounded-lg bg-gray-100 text-gray-800 shadow-sm hover:bg-pink-50 transition">
                  🍰 Cheesecake - <span className="text-sm text-gray-500">Sweet & soft</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center gap-2 items-center pb-6 text-gray-400 text-xs">
              <Smartphone size={14} /> Tap to preview menu
            </div>
          </div>
        </motion.a>

        <motion.div
          className="text-center md:text-left max-w-xl"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Experience Next-Gen Ordering
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6">
            Scan the QR code and explore our interactive digital menu. Order food directly from your table, call the waiter, and get personalized recommendations—all from your phone.
          </p>
          <p className="text-md md:text-lg text-gray-400">
            No downloads, no waiting. Fast, seamless, and optimized for ultimate dining convenience.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DigitalMenuPreview;

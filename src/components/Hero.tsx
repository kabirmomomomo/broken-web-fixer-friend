import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay }
  })
};

const Hero = () => {
  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white py-28">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-20">
        {/* Left: Headline & CTAs */}
        <div className="flex-1 max-w-xl text-center md:text-left space-y-6">
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold leading-tight tracking-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Revolutionizing Dining
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              With Smart QR Menus
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-base md:text-lg text-gray-300"
          >
            Not just a menu – a full-stack dining experience.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0.3}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            {/* <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-transform duration-300 hover:scale-105">
              Get Started
            </button>
            <button className="border border-blue-500 text-blue-400 hover:bg-blue-950 px-6 py-3 rounded-lg font-semibold transition-transform duration-300 hover:scale-105">
              Learn More
            </button> */}
          </motion.div>
        </div>

        {/* Right: Menu Snapshot + Features */}
        <div className="flex-1 flex flex-col items-center gap-6">
          {/* Menu Snapshot Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0.5}
            className="w-[360px] bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl"
          >
            <h3 className="text-center text-lg font-semibold text-white/90 mb-5 tracking-wide">
              Today’s Menu Snapshot
            </h3>
            <div className="space-y-3">
              {[
                "🥗 Starters – Salads & Soups",
                "🍝 Mains – Chef’s Picks",
                "🍨 Desserts – Sweet Cravings"
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-xl p-4 hover:bg-white/20 hover:border-blue-400 transition-all duration-300"
                >
                  <p className="text-white font-medium text-sm">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0.7}
            className="grid grid-cols-2 gap-4 w-full max-w-sm text-sm text-center"
          >
            {[
              { icon: "⚡", title: "Speed", desc: "Orders placed in seconds." },
              { icon: "📈", title: "Insight", desc: "Live performance stats." },
              { icon: "🛠️", title: "Customizable", desc: "Change dishes anytime." },
              { icon: "🤖", title: "AI Powered", desc: "Smart dish suggestions." }
            ].map(({ icon, title, desc }, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/10 rounded-xl p-4 hover:border-purple-400 transition-all duration-300"
              >
                <div className="text-xl">{icon}</div>
                <p className="text-white font-medium">{title}</p>
                <p className="text-gray-400 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Down */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        custom={0.9}
        className="mt-14 mb-2 flex justify-center"
      >
        <button
          onClick={scrollToAbout}
          className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-all duration-300"
        >
          <span className="mb-1 text-xs font-medium">Scroll</span>
          <ArrowDown size={20} className="animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
};

export default Hero;

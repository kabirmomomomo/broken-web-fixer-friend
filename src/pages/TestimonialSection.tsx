import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Rohan S.",
    title: "Owner, Bombay Bistro",
    quote: "EasyMenu transformed our restaurant experience. Guests love the sleek digital menu, and we've seen faster table turnover.",
  },
  {
    name: "Neha M.",
    title: "Cafe Manager, Brewed Bliss",
    quote: "The interface is so intuitive, even our non-tech-savvy customers use it easily. Orders are smoother than ever.",
  },
  {
    name: "Aditya T.",
    title: "Founder, Spice Junction",
    quote: "The sales have gone up since we adopted EasyMenu. The visuals help customers order more confidently.",
  },
];

const TestimonialSection = () => {
  return (
    <section className="snap-start py-24 md:py-32 bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-40 h-40 bg-purple-400/20 blur-3xl rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400/20 blur-3xl rounded-full -z-10" />

      <div className="container mx-auto px-6 md:px-12">
        <motion.h2
          className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          What Our Partners Say
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-start gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-sm hover:shadow-md transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Quote className="text-blue-400 w-5 h-5" />
              <p className="text-gray-300 text-sm leading-relaxed">“{testimonial.quote}”</p>
              <div className="mt-2 text-sm text-gray-400 font-medium">
                — {testimonial.name}, <span className="text-gray-500 italic">{testimonial.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

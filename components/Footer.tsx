import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 bg-gradient-to-b from-[#0f172a] to-[#0f172a] text-white border-t border-white/10">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between gap-12">
        <motion.div
          className="max-w-sm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <a href="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent block mb-4">
            Easy<span className="text-white">Menu</span>
          </a>
          <p className="text-gray-400">
            QR code Menu, that works for you
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Navigate</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-gray-400 hover:text-white transition">About</a></li>
              <li><a href="#work" className="text-gray-400 hover:text-white transition">Work</a></li>
              <li><a href="#process" className="text-gray-400 hover:text-white transition">Process</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Social</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-white transition"
                >
                  <Instagram size={16} className="mr-2" /> Instagram
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-white transition"
                >
                  <Twitter size={16} className="mr-2" /> Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-white transition"
                >
                  <Linkedin size={16} className="mr-2" /> LinkedIn
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mt-16 pt-8 border-t border-white/10 text-sm text-gray-500 flex flex-col md:flex-row md:justify-between items-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="mb-4 md:mb-0">© {currentYear} EasyMenu. All rights reserved.</p>
        <div className="space-x-6">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;

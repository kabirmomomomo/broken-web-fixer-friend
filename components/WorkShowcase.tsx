import { useEffect, useRef } from 'react';
import { ArrowUpRight, QrCode, Utensils, BellRing, BarChart3 } from 'lucide-react';

const workItems = [
  {
    id: 1,
    icon: <QrCode className="w-10 h-10 text-blue-400" />,
    title: "Scan & Order System",
    description: "Transforming restaurant tables with instant QR-based menu access and direct ordering."
  },
  {
    id: 2,
    icon: <Utensils className="w-10 h-10 text-purple-400" />,
    title: "Contactless Digital Menu",
    description: "Seamless menu browsing experience — dynamic, multi-language, visually rich QR menus."
  },
  {
    id: 3,
    icon: <BellRing className="w-10 h-10 text-amber-400" />,
    title: "Table Waiter Call System",
    description: "One-tap waiter calling from table without waving hands — improving customer service speed."
  },
  {
    id: 4,
    icon: <BarChart3 className="w-10 h-10 text-indigo-400" />,
    title: "Smart Restaurant Analytics",
    description: "Real-time insights on ordering patterns, table turnover, and staff efficiency for managers."
  }
];

const WorkShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = sectionRef.current;
    const elements = section?.querySelectorAll('.reveal');

    elements?.forEach(el => observer.observe(el));

    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="py-24 md:py-32 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full -z-10"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent reveal">
            Our Impact
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-300 reveal">
            Solving real problems for restaurants — from faster ordering to smarter operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {workItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md transform transition duration-500 hover:scale-[1.03] hover:border-blue-400/30 hover:shadow-[0_0_30px_5px_rgba(99,102,241,0.15)] cursor-pointer reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white flex items-center">
                  {item.title}
                  <ArrowUpRight size={18} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </div>
              <p className="text-gray-300 text-sm transition-colors duration-300 group-hover:text-gray-200">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkShowcase;

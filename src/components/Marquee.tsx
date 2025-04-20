
const Marquee = () => {
  return (
    <div className="py-12 bg-black text-white overflow-hidden">
      <div className="whitespace-nowrap flex animate-marquee">
        {Array(10).fill("         Domino's Burger King         ").map((text, index) => (
          <span key={index} className="mx-4 text-lg md:text-xl font-medium">
            {text} <span className="mx-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;

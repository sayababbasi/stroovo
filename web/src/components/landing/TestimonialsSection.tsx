export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Stroovo has completely transformed how our engineering and product teams collaborate. We've cut our meeting times in half.",
      name: "Sarah Jenkins",
      title: "VP of Engineering",
      company: "CloudScale",
      avatar: "https://i.pravatar.cc/150?img=47"
    },
    {
      quote: "The ability to connect high-level goals directly to daily tasks has aligned our entire organization. It's the most powerful tool we use.",
      name: "David Chen",
      title: "Director of Operations",
      company: "Nexus Financial",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      quote: "Finally, a work management platform that doesn't feel like a chore to use. Our team adoption was instantaneous.",
      name: "Emily Rodriguez",
      title: "Head of Marketing",
      company: "Lumina Studio",
      avatar: "https://i.pravatar.cc/150?img=32"
    }
  ];

  return (
    <section className="py-24 bg-transparent overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6">
        
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Customer Stories</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Teams Work Better With Stroovo
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            See how forward-thinking organizations are using Stroovo to plan, collaborate, and deliver exceptional results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="text-[#0052CC] mb-6 opacity-80">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 text-[16px] leading-relaxed font-medium mb-8">
                  "{testimonial.quote}"
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-gray-900 text-sm font-bold">{testimonial.name}</div>
                  <div className="text-gray-500 text-xs">{testimonial.title}, {testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


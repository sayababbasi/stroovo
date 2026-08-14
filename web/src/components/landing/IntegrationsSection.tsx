export default function IntegrationsSection() {
  const integrations = [
    { name: "Slack", color: "bg-[#E01E5A]", letter: "S" },
    { name: "Microsoft Teams", color: "bg-[#6264A7]", letter: "T" },
    { name: "Google Workspace", color: "bg-[#4285F4]", letter: "G" },
    { name: "GitHub", color: "bg-[#24292E]", letter: "GH" },
    { name: "Jira", color: "bg-[#0052CC]", letter: "J" },
    { name: "Zoom", color: "bg-[#2D8CFF]", letter: "Z" },
    { name: "Dropbox", color: "bg-[#0061FF]", letter: "D" },
    { name: "Zapier", color: "bg-[#FF4A00]", letter: "Za" },
  ];

  return (
    <section className="py-24 bg-transparent border-y border-gray-100 overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 text-center">
        
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
          <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Works With Your Existing Stack</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight max-w-3xl mx-auto">
          Connect Stroovo With the Tools You Already Use
        </h2>
        
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-16 leading-relaxed">
          Your tools. One connected workspace. Sync data, automate actions, and keep everything in one place.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {integrations.map((tool, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default group"
            >
              <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {tool.letter}
              </div>
              <span className="text-[15px] font-bold text-gray-800">{tool.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


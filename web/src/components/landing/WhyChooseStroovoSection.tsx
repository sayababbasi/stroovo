import { LayoutDashboard, Users, Zap, LineChart } from "lucide-react";

export default function WhyChooseStroovoSection() {
  const features = [
    {
      icon: <LayoutDashboard size={24} className="text-purple-600" />,
      iconBg: "bg-purple-100",
      title: "Unified Workspace",
      description: "All your projects, tasks, teams, and communication in one centralized hub."
    },
    {
      icon: <Users size={24} className="text-blue-600" />,
      iconBg: "bg-blue-100",
      title: "Powerful Collaboration",
      description: "Real-time updates, comments, mentions, and file sharing keep everyone aligned."
    },
    {
      icon: <Zap size={24} className="text-emerald-600" />,
      iconBg: "bg-emerald-100",
      title: "Smart Automation",
      description: "Automate workflows, approvals, and notifications to save time and reduce manual work."
    },
    {
      icon: <LineChart size={24} className="text-amber-600" />,
      iconBg: "bg-amber-100",
      title: "Data-Driven Insights",
      description: "Advanced analytics and reports help you make smarter decisions and drive results."
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent border-b border-gray-100">
      <div className="max-w-[1300px] mx-auto px-6">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Why Teams Choose Stroovo</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            One Platform. Infinite Possibilities.
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
            Stroovo brings everything your team needs to plan, collaborate, and achieve all in one secure, scalable platform.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-default"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


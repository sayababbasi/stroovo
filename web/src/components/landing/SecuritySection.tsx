import { ShieldCheck, Lock, FileKey, Server } from "lucide-react";

export default function SecuritySection() {
  const securityFeatures = [
    {
      title: "Role-Based Access",
      desc: "Granular permissions ensure users only see and edit what they need to.",
      icon: <Lock size={24} className="text-white" />,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Enterprise Security",
      desc: "Enterprise-ready security controls protect your organization's data.",
      icon: <ShieldCheck size={24} className="text-white" />,
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Audit & Compliance",
      desc: "Track activity and maintain detailed audit logs across your workspace.",
      icon: <FileKey size={24} className="text-white" />,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Reliable Infrastructure",
      desc: "Built on highly available infrastructure designed for scale and uptime.",
      icon: <Server size={24} className="text-white" />,
      gradient: "from-amber-500 to-amber-600"
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-transparent overflow-hidden border-b border-gray-100">
      <div className="max-w-[1300px] mx-auto px-6">
        
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-blue-600 text-xs font-bold tracking-wide uppercase">Enterprise Grade</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight max-w-2xl">
            Built for Enterprise.<br />Designed for Trust.
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Stroovo provides the robust security, privacy, and administrative controls required by leading organizations worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-inner mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


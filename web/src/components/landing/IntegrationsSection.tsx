"use client";

import { motion } from "framer-motion";

export default function IntegrationsSection() {
  const integrations = [
    { 
      name: "Slack", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523A2.528 2.528 0 0 1 5.042 10.12a2.528 2.528 0 0 1 2.521 2.522v2.523H5.042ZM6.313 15.165a2.528 2.528 0 0 1 2.521-2.523 2.528 2.528 0 0 1 2.521 2.523v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313ZM8.834 5.042a2.528 2.528 0 0 1 2.521-2.52A2.528 2.528 0 0 1 13.876 5.042a2.528 2.528 0 0 1-2.521 2.521H8.834V5.042ZM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.521A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.521-2.521h6.313ZM18.958 8.835a2.528 2.528 0 0 1 2.52 2.522 2.528 2.528 0 0 1-2.52 2.522 2.528 2.528 0 0 1-2.521-2.522V8.835h2.521ZM17.687 8.835a2.528 2.528 0 0 1-2.521 2.522 2.528 2.528 0 0 1-2.521-2.522V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.313ZM15.166 18.958a2.528 2.528 0 0 1-2.521 2.52 2.528 2.528 0 0 1-2.521-2.52 2.528 2.528 0 0 1 2.521-2.521h2.521v2.521ZM15.166 17.687a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.521 2.521h-6.313Z" fill="#E01E5A"/>
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523A2.528 2.528 0 0 1 5.042 10.12a2.528 2.528 0 0 1 2.521 2.522v2.523H5.042ZM6.313 15.165a2.528 2.528 0 0 1 2.521-2.523 2.528 2.528 0 0 1 2.521 2.523v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313Z" fill="#36C5F0"/>
          <path d="M8.834 5.042a2.528 2.528 0 0 1 2.521-2.52A2.528 2.528 0 0 1 13.876 5.042a2.528 2.528 0 0 1-2.521 2.521H8.834V5.042ZM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.521A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.521-2.521h6.313Z" fill="#2EB67D"/>
          <path d="M18.958 8.835a2.528 2.528 0 0 1 2.52 2.522 2.528 2.528 0 0 1-2.52 2.522 2.528 2.528 0 0 1-2.521-2.522V8.835h2.521ZM17.687 8.835a2.528 2.528 0 0 1-2.521 2.522 2.528 2.528 0 0 1-2.521-2.522V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.313Z" fill="#E01E5A"/>
          <path d="M15.166 18.958a2.528 2.528 0 0 1-2.521 2.52 2.528 2.528 0 0 1-2.521-2.52 2.528 2.528 0 0 1 2.521-2.521h2.521v2.521ZM15.166 17.687a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.313A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.521 2.521h-6.313Z" fill="#ECB22E"/>
        </svg>
      )
    },
    { 
      name: "Microsoft Teams", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="#7B83EB"/>
          <path d="M5.5 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="#7B83EB"/>
          <path d="M15.5 21a5.5 5.5 0 0 0-9 0h9Z" fill="#7B83EB"/>
          <path d="M9.5 21a5.5 5.5 0 0 1-3.61-9.68 3.48 3.48 0 0 0-3.89.68A5.5 5.5 0 0 0 2 21h7.5Z" fill="#7B83EB"/>
          <path d="M22 6H13a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z" fill="#5059C9"/>
          <path d="M14.5 11h2v4h1v-4h2v-1h-5v1Z" fill="#FFFFFF"/>
        </svg>
      )
    },
    { 
      name: "Google Workspace", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z" fill="#fff"/>
          <path d="M16.44 14.12l-2.22-3.84h-4.44l-2.22 3.84 2.22 3.84h4.44l2.22-3.84Z" fill="#4285F4"/>
          <path d="M16.44 14.12h4.44l-2.22 3.84-4.44-7.68h-4.44L12 6.44l2.22-3.84 6.66 11.52H16.44Z" fill="#34A853"/>
          <path d="M7.56 14.12l-2.22 3.84-2.22-3.84L7.56 6.44h4.44L9.78 10.28l-2.22 3.84Z" fill="#FBBC04"/>
          <path d="M16.44 14.12L14.22 17.96h-4.44L7.56 14.12 9.78 10.28l2.22 3.84h4.44Z" fill="#EA4335"/>
        </svg>
      )
    },
    { 
      name: "GitHub", 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#24292E]" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.153-1.11-1.46-1.11-1.46-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z"/>
        </svg>
      )
    },
    { 
      name: "Jira", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.01a1 1 0 0 1-.29.7l-5.63 5.63a1 1 0 0 1-1.41 0L9.61 12.72a1 1 0 0 1 0-1.42l5.62-5.62a1 1 0 0 1 1.41 0l5.63 5.63c.19.19.29.44.29.7Z" fill="#2684FF"/>
          <path d="M14.39 12.01a1 1 0 0 1-.29.7l-5.63 5.63a1 1 0 0 1-1.41 0l-5.62-5.62a1 1 0 0 1 0-1.42l5.62-5.62a1 1 0 0 1 1.41 0l5.63 5.63c.19.19.29.44.29.7Z" fill="#0052CC"/>
        </svg>
      )
    },
    { 
      name: "Zoom", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="#2D8CFF"/>
          <path d="M16 8.5L12 11V8a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3l4 2.5a.5.5 0 0 0 .75-.43v-7.14A.5.5 0 0 0 16 8.5Z" fill="#FFFFFF"/>
        </svg>
      )
    },
    { 
      name: "Dropbox", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L0 6l6 4-6 4 6 4 6-4-6-4 6-4L6 2Z" fill="#0061FF"/>
          <path d="M18 2l-6 4 6 4 6-4-6-4Zm-6 12l6-4 6 4-6 4-6-4ZM6 19.5l6-4 6 4-6 4-6-4Z" fill="#0061FF"/>
        </svg>
      )
    },
    { 
      name: "Zapier", 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.62 1.63L11.59 9H18.7a1.05 1.05 0 0 1 1.04 1.25l-2.03 10.02c-.15.72-1.07.96-1.55.4l-7.78-9.03A1.05 1.05 0 0 1 9.17 10H4c-.81 0-1.28-.9-1.03-1.63L7 2.05A1.05 1.05 0 0 1 8 1.33h4.6c.71 0 1.24.63 1.02 1.3Z" fill="#FF4A00"/>
        </svg>
      )
    }
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              key={index} 
              className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:bg-gray-100 transition-all duration-300 border border-gray-100`}>
                {tool.icon}
              </div>
              <span className="text-[15px] font-bold text-gray-800">{tool.name}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

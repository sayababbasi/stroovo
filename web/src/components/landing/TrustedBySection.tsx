"use client";

import { motion } from "framer-motion";

export default function TrustedBySection() {
  const logos = [
    {
      name: "Microsoft",
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
        </svg>
      )
    },
    {
      name: "Stripe",
      svg: (
        <svg viewBox="0 0 72 30" fill="currentColor" className="h-7">
          <path d="M33.633 13.568c0-2.392-1.505-3.562-3.865-3.562-3.155 0-5.748 2.05-5.748 5.626 0 3.321 2.228 5.485 5.768 5.485 1.765 0 3.238-.501 4.385-1.353v-3.328a6.234 6.234 0 0 1-4.225 1.543c-1.365 0-2.188-.502-2.348-1.543h10.373c.04-.381.06-.821.06-1.343v-1.525zm-6.029-1.303c.12-1.023 1.103-1.685 2.268-1.685 1.205 0 2.088.622 2.148 1.685h-4.416zM46.726 13.929c0-1.805-.441-3.23-1.325-4.253C44.458 8.613 42.973 8.132 41 8.132c-1.745 0-3.11.481-4.074 1.444v-1.124h-3.61v17.433h3.75v-4.591a5.334 5.334 0 0 0 4.094 1.665c1.905 0 3.378-.502 4.305-1.525.964-1.043 1.444-2.507 1.444-4.373h-1.18v-.17zm-3.885.12c0 2.167-1.164 3.491-3.09 3.491-1.945 0-3.15-1.324-3.15-3.511 0-2.187 1.205-3.511 3.15-3.511 1.946 0 3.09 1.324 3.09 3.531zM51.983 22.868h3.75V8.453h-3.75v14.415zM53.849 0c-1.284 0-2.327 1.043-2.327 2.347 0 1.284 1.043 2.327 2.327 2.327 1.304 0 2.347-1.043 2.347-2.327C56.196 1.043 55.153 0 53.849 0zM15.42 16.517c0-3.692-2.307-5.598-5.356-5.598-1.545 0-2.889.461-3.932 1.304V8.453H2.382v14.415h3.75v-1.043a5.556 5.556 0 0 0 4 1.464c2.989 0 5.286-2.026 5.286-5.541v-1.231zm-3.845.2c0 2.066-1.184 3.33-2.869 3.33-1.625 0-2.829-1.264-2.829-3.27 0-2.046 1.204-3.33 2.829-3.33 1.685 0 2.87 1.264 2.87 3.27zM24.787 8.453V11.2a4.345 4.345 0 0 0-3.792-1.324h-1.264v3.531h1.344c1.605 0 2.929 1.103 2.929 2.768v6.694h3.75v-7.155c0-3.832-2.488-6.178-6.08-6.178h-.02zm37.288 1.485c-.963-1.244-2.408-1.806-4.273-1.806-1.785 0-3.23.461-4.253 1.364-1.043.903-1.564 2.207-1.564 3.832v1.304c0 3.651 2.307 5.556 5.376 5.556 1.545 0 2.95-.441 4.093-1.324v-3.29c-.843.823-2.006 1.324-3.35 1.324-1.926 0-3.15-1.284-3.15-3.47H72v-1.164c0-1.825-.502-3.33-1.444-4.433v1.107zm-6.223 2.227c.18-1.023 1.144-1.685 2.347-1.685 1.224 0 2.126.622 2.227 1.685h-4.574zM6.505 28.536c4.674 0 8.044-1.886 10.432-5.116l-3.35-1.846c-1.525 2.167-3.872 3.39-6.88 3.39-3.411 0-6.159-1.926-7.123-5.015H17.82V18.15c0-4.674-3.15-8.204-7.823-8.204-4.834 0-8.525 3.65-8.525 8.425 0 4.794 3.73 8.425 8.583 8.425h-.13v-2.25l-3.42 3.99zM2.87 16.52c.622-2.126 2.668-3.69 5.316-3.69 2.507 0 4.493 1.484 5.155 3.51l-10.471.18z"/>
        </svg>
      )
    },
    {
      name: "GitHub",
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )
    },
    {
      name: "Slack",
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.523-2.522v-2.522h2.523zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.523-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
      )
    },
    {
      name: "Netflix",
      svg: (
        <svg viewBox="0 0 111 30" fill="currentColor" className="h-6">
          <path d="M105.062 14.28L111 30c-1.75-.25-3.499-.563-5.28-.845l-3.345-8.686-3.437 8.122c-1.734-.282-3.45-.607-5.186-.921l5.966-13.61L94.237 0h5.56l3.298 8.64L106.334 0h5.456l-6.728 14.28zM87.5 24.316c-1.921-.362-3.834-.69-5.748-1.026v-5.263h6.059v-4.526h-6.059V5.158H88.5V.632h-12v22.569c1.922.378 3.81.71 5.75 1.116zM71.745 27.27c-1.715-.226-3.428-.475-5.14-.731V.631h5.14V27.27zM62.628 28.536V13.523h-3.393V8.997h3.393V4.935c0-2.31 1.096-4.996 5.437-4.996h4.37v4.614h-2.822c-1.91 0-1.846.86-1.846 2.052v2.392h4.896v4.526h-4.896v14.077c-1.722-.315-3.43-.637-5.14-.991L62.628 28.536zM46.732 24.582c0-1.751.01-4.733.01-4.733h5.717v-4.526h-5.717V5.158H53.1V.632H41.593v22.756c1.722.35 3.447.697 5.139 1.066l.01.128zM30.638 22.023v-5.694h6.035v-4.526h-6.035V5.158h6.417V.632h-11.55v23.275c1.71.378 3.427.766 5.133 1.135zM22.096 16.488V.632h-4.84L9.066 17.512V.632H4.216V28.26C5.972 28.618 7.747 29 9.53 29.358L17.914 16.14l.012 11.23c1.72-.256 3.454-.504 5.184-.73v-1.164l-1.014 9.012z"/>
        </svg>
      )
    },
    {
      name: "Uber",
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6">
          <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm0-20.084c4.464 0 8.084 3.62 8.084 8.084S16.464 20.084 12 20.084 3.916 16.464 3.916 12 7.536 3.916 12 3.916zm3.327 7.02H8.673a1.065 1.065 0 0 0-1.064 1.064v3.541h3.327v-2.478h2.128v2.478h3.327v-3.541a1.065 1.065 0 0 0-1.064-1.064z"/>
        </svg>
      )
    },
    {
      name: "Figma",
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7">
          <path d="M8 12.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 3.5-3.5v-3.5H8zm3.5-3.5a3.5 3.5 0 1 0 0 7h3.5v-3.5a3.5 3.5 0 0 0-3.5-3.5zm-3.5-7a3.5 3.5 0 1 0 0 7h3.5v-3.5A3.5 3.5 0 0 0 8 2zm7 0a3.5 3.5 0 1 0 0 7A3.5 3.5 0 0 0 15 2zM8 9a3.5 3.5 0 1 0 0 7h3.5v-7H8z"/>
        </svg>
      )
    },
    {
      name: "Notion",
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6">
           <path d="M4.619 3.036L14.7 1.258l4.981.89-1.245.89-.979.089v15.228l4.359 4.364v.533L9.624 24l-5.69-1.157 1.424-.979 1.157-.089V7.13L2.157 2.68 1.98 2.057l2.64-1.02zM17.014 4.192H16.213L7.756 18.077V6.06l9.258-1.868v16.368h.8l8.455-13.882v12.01l-9.255 1.868V4.192z"/>
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-transparent border-b border-gray-100 overflow-hidden relative">
      <div className="max-w-[1300px] mx-auto px-6 mb-16 relative z-10">
        <div className="flex flex-col items-center">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             className="text-center"
           >
              <h3 className="text-[13px] md:text-[14px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                 Trusted by modern engineering teams
              </h3>
           </motion.div>
        </div>
      </div>
      
      {/* Infinite Carousel Container */}
      <div className="relative w-full overflow-hidden flex">
         {/* Left & Right Gradients for smooth fade-in/fade-out */}
         <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
         <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
         
         {/* Moving track */}
         <div className="flex animate-infinite-scroll whitespace-nowrap min-w-max hover:[animation-play-state:paused]">
            
            {/* Group 1 */}
            <div className="flex items-center gap-x-16 md:gap-x-24 px-8 md:px-12">
              {logos.map((logo, index) => (
                <div 
                  key={index} 
                  className="text-[#8A94A6] hover:text-[#0052CC] transition-colors duration-300 cursor-default select-none flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-105 transform"
                  title={logo.name}
                >
                  {logo.svg}
                  <span className="ml-3 font-bold text-xl md:text-2xl tracking-tight hidden md:block">
                     {logo.name !== "Notion" && logo.name !== "Stripe" && logo.name !== "Netflix" && logo.name !== "GitHub" ? logo.name : ""}
                  </span>
                </div>
              ))}
            </div>

            {/* Group 2 (Exact Duplicate for seamless loop) */}
            <div className="flex items-center gap-x-16 md:gap-x-24 px-8 md:px-12">
              {logos.map((logo, index) => (
                <div 
                  key={`dup-${index}`} 
                  className="text-[#8A94A6] hover:text-[#0052CC] transition-colors duration-300 cursor-default select-none flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-105 transform"
                  title={logo.name}
                >
                  {logo.svg}
                  <span className="ml-3 font-bold text-xl md:text-2xl tracking-tight hidden md:block">
                     {logo.name !== "Notion" && logo.name !== "Stripe" && logo.name !== "Netflix" && logo.name !== "GitHub" ? logo.name : ""}
                  </span>
                </div>
              ))}
            </div>

         </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 35s linear infinite;
        }
      `}} />
    </section>
  );
}


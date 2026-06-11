"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Globe,
  Users,
  Eye,
  Flame,
  Target,
  Star,
} from "lucide-react";

// Brand icons removed from lucide-react v1.x — using inline SVGs
const Youtube = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const Instagram = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const projects = [
  {
    client: "Carlos Santana",
    type: "Long-form Content",
    description: "Canal de Roblox.",
    stats: ["3,4 milhões de inscritos", "319.748.548 visualizações"],
    youtube: "https://www.youtube.com/@IamCarlosSantana/videos",
    instagram: "",
    website: "",
    color: "from-red-500/20 to-orange-500/10",
    featured: true,
  },
  {
    client: "Viaja Britto",
    type: "Long-form Content",
    description: "Canal de viagens para YouTube.",
    stats: ["48.6K inscritos", "15.904.413 visualizações"],
    youtube: "https://www.youtube.com/@Viajabrito/videos",
    instagram: "",
    website: "",
    color: "from-primary/20 to-rose-500/10",
    featured: true,
  },
  {
    client: "O Meu Perfil Geek",
    type: "Long-form Content",
    description: "Canal focado em anime e cultura geek.",
    stats: ["11.3K inscritos", "1.618.621 visualizações"],
    youtube: "https://www.youtube.com/@omeuperfilgeek",
    instagram: "",
    website: "",
    color: "from-primary/20 to-pink-500/10",
    featured: true,
  },
];

const categories = [
  { icon: Flame, label: "Reels Virais" },
  { icon: Target, label: "Anúncios/Criativos" },
  { icon: Star, label: "Long-form" },
];

export default function Portfolio() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="portfolio" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,27,27,0.05)_0%,transparent_60%)]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-primary/80 font-medium">
            Destaques
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
            Projetos que geraram{" "}
            <span className="gradient-text-red">resultados reais</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Projetos que geraram resultados reais para os meus clientes.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((cat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/50 hover:text-primary hover:border-primary/20 transition-all duration-300 cursor-default"
            >
              <cat.icon size={14} />
              {cat.label}
            </div>
          ))}
        </motion.div>

        {/* Featured projects */}
        <div className="space-y-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              className="group relative rounded-2xl overflow-hidden glass hover:border-primary/30 transition-all duration-500"
            >
              <div className="relative p-8 md:p-12">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-primary/10">
                      {project.profileImage ? (
                        <img
                          src={project.profileImage}
                          alt={project.client}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                          <Users size={32} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Star size={14} className="text-white fill-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        ★ Destaque
                      </span>
                      <span className="text-xs text-white/40 tracking-wider uppercase">
                        {project.type}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                      {project.client}
                    </h3>
                    
                    <p className="text-white/50 mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      {project.stats.map((stat, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-sm"
                        >
                          {j === 0 ? (
                            <Users size={14} className="text-primary" />
                          ) : (
                            <Eye size={14} className="text-primary" />
                          )}
                          <span className="text-white/70">{stat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Icons */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {project.youtube && (
                      <a
                        href={project.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-red-600/10 hover:bg-red-600/20 flex items-center justify-center text-red-500 hover:text-red-400 transition-all duration-300"
                      >
                        <Youtube size={20} />
                      </a>
                    )}
                    {project.instagram && (
                      <a
                        href={project.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-pink-600/10 hover:bg-pink-600/20 flex items-center justify-center text-pink-500 hover:text-pink-400 transition-all duration-300"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {project.website && (
                      <a
                        href={project.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary hover:text-primary/80 transition-all duration-300"
                      >
                        <Globe size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* YT Jobs Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.ytjobs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-primary/60 transition-colors duration-300"
          >
            Página no YT Jobs
          </a>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import { motion } from "motion/react";
import { Terminal, Zap, Cpu, Layers } from "lucide-react";

export function ArchitectTerminal() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium tracking-widest text-zinc-400 uppercase">Architect Prime // Core</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-10 space-y-8">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl sm:text-4xl font-light tracking-tight text-white"
          >
            System <span className="font-medium text-emerald-400">Online</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-zinc-500 leading-relaxed max-w-xl"
          >
            Bleeding-edge architecture engine initialized. Motion-first paradigms engaged. 
            Awaiting basic concepts for synthesis into high-fidelity, production-ready implementation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, label: "Motion-First", desc: "Hardware-accelerated orchestration" },
            { icon: Layers, label: "Extreme Modularity", desc: "Atomic, type-safe architecture" },
            { icon: Cpu, label: "Bleeding Edge", desc: "Next 15, React 19, Motion v12" }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
            >
              <item.icon className="w-5 h-5 text-zinc-400 mb-3" />
              <h3 className="text-sm font-medium text-zinc-200 mb-1">{item.label}</h3>
              <p className="text-xs text-zinc-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pt-6 border-t border-white/5 flex items-center gap-3"
        >
          <div className="w-2 h-4 bg-emerald-400 animate-pulse" />
          <span className="text-sm text-zinc-400">ERR_MISSING_INPUT: Please provide [BASIC CONCEPTS] to begin synthesis...</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

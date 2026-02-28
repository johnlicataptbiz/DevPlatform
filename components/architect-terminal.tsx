"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Terminal, Zap, Cpu, Layers, Send, Loader2 } from "lucide-react";

export function ArchitectTerminal() {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"redesign" | "inspire">("redesign");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Synthesizing response...");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    // Ensure URL has protocol
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const isRevision = mode === "redesign";
    const modeText = isRevision ? "REVISION TARGET" : "REFERENCE MATERIAL";
    const userText = `[${modeText}] ${targetUrl}`;
    
    const userMessage = { role: "user" as const, content: userText };
    setMessages((prev) => [...prev, userMessage]);
    setUrl("");
    setIsLoading(true);
    setLoadingText(`Analyzing ${modeText.toLowerCase()}: ${targetUrl}...`);

    try {
      let apiContent = userText;
      
      try {
        setLoadingText(`Fetching content from: ${targetUrl}...`);
        
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
        });
        
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          
          // Check if the content was fetched from cache
          if (scrapeData.fromCache) {
            setLoadingText(`Using cached content from: ${targetUrl}...`);
          }
          
          if (isRevision) {
            apiContent += `\n\n[SYSTEM: The user provided a URL as a ${modeText}. You must analyze the following scraped content from ${targetUrl}, identify its core purpose, structure, and flaws, and then architect a vastly superior, bleeding-edge replacement using your advanced tech stack. Do not just copy it; obliterate its current form and synthesize a next-generation version:]\n"""\n${scrapeData.content}\n"""`;
          } else {
            apiContent += `\n\n[SYSTEM: The user provided a URL as ${modeText}. Use the following scraped content from ${targetUrl} strictly as context, documentation, or inspiration to answer their query or build what they asked for:]\n"""\n${scrapeData.content}\n"""`;
          }
        } else {
          const errorData = await scrapeRes.json();
          console.error("Scraping failed:", errorData.error);
          // Even if scraping fails, continue with the original URL to let the AI handle it
          if (isRevision) {
            apiContent += `\n\n[SYSTEM: Failed to scrape URL ${targetUrl}. The user provided this URL as a ${modeText} but content extraction failed. Provide guidance on how to approach this URL.]`;
          } else {
            apiContent += `\n\n[SYSTEM: Failed to scrape URL ${targetUrl}. The user provided this URL as ${modeText} but content extraction failed. Provide general guidance related to this URL.]`;
          }
        }
      } catch (scrapeErr) {
        console.error("Scraping failed:", scrapeErr);
        // Even if scraping fails, continue with the original URL to let the AI handle it
        if (isRevision) {
          apiContent += `\n\n[SYSTEM: Failed to scrape URL ${targetUrl}. The user provided this URL as a ${modeText} but content extraction failed. Provide guidance on how to approach this URL.]`;
        } else {
          apiContent += `\n\n[SYSTEM: Failed to scrape URL ${targetUrl}. The user provided this URL as ${modeText} but content extraction failed. Provide general guidance related to this URL.]`;
        }
      }
      
      setLoadingText("Synthesizing response...");

      const apiMessage = { role: "user" as const, content: apiContent };
      const messagesForApi = [...messages, apiMessage];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForApi,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ERR_CONNECTION_FAILED: Unable to reach the architecture engine." },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingText("Synthesizing response...");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/10 flex flex-col h-[80vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02] shrink-0">
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

      {/* Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
        {messages.length === 0 ? (
          <>
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
          </>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-500/10 text-emerald-100 border border-emerald-500/20"
                      : "bg-white/5 text-zinc-300 border border-white/10"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-sm text-zinc-400">{loadingText}</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-zinc-950/80 shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => setMode("redesign")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === "redesign" 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                : "bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10"
            }`}
          >
            Revise this site
          </button>
          <button
            type="button"
            onClick={() => setMode("inspire")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === "inspire" 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                : "bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10"
            }`}
          >
            Use as inspiration
          </button>
        </div>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-4 flex items-center justify-center">
            <div className="w-2 h-4 bg-emerald-400 animate-pulse" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a URL to begin synthesis (e.g., https://example.com)..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="absolute right-2 p-2 text-zinc-400 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-zinc-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Space_Grotesk, Inter } from "next/font/google"
import { 
  ArrowRight, 
  Github, 
  Smartphone, 
  Server, 
  Shield, 
  Layers, 
  Mail, 
  Play, 
  Settings, 
  Database, 
  FolderUp, 
  Code2, 
  Zap, 
  Lock, 
  Cloud, 
  Users, 
  Check
} from "lucide-react"
import "./landing/landing.css"
import { ModeToggle } from "@/components/Mode/modeToggle"

// Initialize Premium Fonts
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] })
const inter = Inter({ subsets: ["latin"] })

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"collab" | "editor" | "caching">("collab")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className={`landing-root noise-overlay ${inter.className}`}>
      
      <header className={`landing-header ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-pill">
          <Link href="/" className="logo-link">
            <div className="logo-symbol">W</div>
            <span className={`logo-text ${spaceGrotesk.className}`}>Workbench Studio</span>
          </Link>

          <nav className="nav-links">
            <a href="#features" className="nav-item">Features</a>
            <a href="#flowchart" className="nav-item">Pipeline</a>
            <a href="#editor-showcase" className="nav-item">Platform</a>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Link href="/dashboard" className="nav-cta-pill font-sans">
              Open Studio
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-sec mild-grid">
        <div className="hero-glow-container">
          <div className="hero-glow-orb hero-orb-cyan" />
          <div className="hero-glow-orb hero-orb-emerald" />
        </div>

        <h1 className={`hero-heading ${spaceGrotesk.className}`}>
          Your system <span className="hero-highlight">architecture</span> starts here.
        </h1>

        <p className="hero-subheading">
          Stop drawing boxes manually. Describe your software system in plain text, and watch a structured interactive diagram build itself instantly.
        </p>

        <div className="hero-actions-container">
          <Link href="/dashboard" className="pill-btn-white">
            Start Designing <ArrowRight className="w-4 h-4" />
          </Link>
          <a 
            href="https://github.com/aryyann011/Workbench-Studio" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="pill-btn-outline"
          >
            <Github className="w-4 h-4" /> Star on GitHub
          </a>
        </div>

        <div className="isometric-preview-wrapper">
          <div className="isometric-container border-glow">
            <div className="preview-bar">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
              <span className="preview-tab-label">architecture.wbs</span>
            </div>
            
            <div className="preview-workspace-split">
              <div className="preview-editor-pane">
                <div className="editor-line">
                  <span className="line-num">1</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Client Application</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">API Gateway</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">2</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">API Gateway</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Auth Service</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">3</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">API Gateway</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Collaboration Engine</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">4</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Auth Service</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Collaboration Engine</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">5</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Collaboration Engine</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Event Queue</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">6</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Event Queue</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Background Processor</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">7</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Client Application</span><span className="syntax-bracket">]</span>
                    <span className="syntax-keyword"> inside </span>
                    <span className="syntax-bracket">[</span><span className="syntax-group">Client Phase</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
              </div>

              {/* Right Pane: Diagram View (Fixed Coordinate System) */}
              <div className="preview-canvas-pane relative overflow-hidden bg-[#060608] border-l border-white/5 flex items-center justify-center min-h-[350px]">
                
                {/* SVG Coordinate Space locks lines and nodes together permanently */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
                  
                  {/* Define the arrowheads so they actually render */}
                  <defs>
                    <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(34, 211, 238, 0.4)" />
                    </marker>
                    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(52, 211, 153, 0.4)" />
                    </marker>
                    <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(251, 191, 36, 0.4)" />
                    </marker>
                  </defs>

                  {/* 1. The Connection Lines (Rendered behind the nodes) */}
                  {/* Client to API Gateway */}
                  <path d="M 181 100 L 405 100" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow-cyan)" />
                  
                  {/* API Gateway to Auth Service (Curved routing) */}
                  <path d="M 483 125 C 483 190, 113 190, 113 247" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
                  
                  {/* Auth Service to Collab Engine */}
                  <path d="M 181 280 L 405 280" fill="none" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1.5" markerEnd="url(#arrow-emerald)" />

                  {/* 2. The Nodes (HTML embedded perfectly inside SVG coordinates) */}
                  
                  {/* Client App Node */}
                  <foreignObject x="45" y="75" width="136" height="50">
                    <div className="w-full h-full bg-[#08080a]/90 border border-white/[0.06] rounded-xl shadow-lg flex items-center p-2 gap-2.5 border-l-[3px] border-l-cyan-400/70">
                      <div className="bg-cyan-500/5 p-1 rounded border border-cyan-500/10 flex items-center justify-center"><Smartphone className="w-3.5 h-3.5 text-cyan-400/80"/></div>
                      <div className="flex flex-col justify-center text-left">
                        <span className="text-[10px] font-semibold text-slate-200 leading-none">Client App</span>
                        <span className="text-[7.5px] font-medium tracking-wider text-slate-500 uppercase mt-1">Client</span>
                      </div>
                    </div>
                  </foreignObject>

                  {/* API Gateway Node */}
                  <foreignObject x="415" y="75" width="136" height="50">
                    <div className="w-full h-full bg-[#08080a]/90 border border-white/[0.06] rounded-xl shadow-lg flex items-center p-2 gap-2.5 border-l-[3px] border-l-emerald-400/70">
                      <div className="bg-emerald-500/5 p-1 rounded border border-emerald-500/10 flex items-center justify-center"><Server className="w-3.5 h-3.5 text-emerald-400/80"/></div>
                      <div className="flex flex-col justify-center text-left">
                        <span className="text-[10px] font-semibold text-slate-200 leading-none">API Gateway</span>
                        <span className="text-[7.5px] font-medium tracking-wider text-slate-500 uppercase mt-1">Endpoint</span>
                      </div>
                    </div>
                  </foreignObject>

                  {/* Auth Service Node */}
                  <foreignObject x="45" y="255" width="136" height="50">
                    <div className="w-full h-full bg-[#08080a]/90 border border-white/[0.06] rounded-xl shadow-lg flex items-center p-2 gap-2.5 border-l-[3px] border-l-amber-500/70">
                      <div className="bg-amber-500/5 p-1 rounded border border-amber-500/10 flex items-center justify-center"><Shield className="w-3.5 h-3.5 text-amber-500/80"/></div>
                      <div className="flex flex-col justify-center text-left">
                        <span className="text-[10px] font-semibold text-slate-200 leading-none">Auth Service</span>
                        <span className="text-[7.5px] font-medium tracking-wider text-slate-500 uppercase mt-1">Service</span>
                      </div>
                    </div>
                  </foreignObject>

                  {/* Collab Engine Node */}
                  <foreignObject x="415" y="255" width="136" height="50">
                    <div className="w-full h-full bg-[#08080a]/90 border border-white/[0.06] rounded-xl shadow-lg flex items-center p-2 gap-2.5 border-l-[3px] border-l-blue-500/70">
                      <div className="bg-blue-500/5 p-1 rounded border border-blue-500/10 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-blue-500/80"/></div>
                      <div className="flex flex-col justify-center text-left">
                        <span className="text-[10px] font-semibold text-slate-200 leading-none">Collab Engine</span>
                        <span className="text-[7.5px] font-medium tracking-wider text-slate-500 uppercase mt-1">Component</span>
                      </div>
                    </div>
                  </foreignObject>

                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ The Premium Bento Grid (Replacement Section) ═══════ */}
      <section className="landing-section bento-sec">
        <div className="section-inner">
          
          <div className="section-header text-center items-center flex flex-col mb-16">
            <span className="section-label text-emerald-400">The Workbench Engine</span>
            <h2 className={`section-title ${spaceGrotesk.className} max-w-2xl`}>
              Complex architecture, distilled into a seamless workflow.
            </h2>
          </div>

          <div className="bento-grid-container">
            
            {/* Bento Box 1: The DSL */}
            <div className="bento-card bento-large border-glow-hover bg-slate-900/40 flex flex-col md:flex-row items-center gap-6">
              <div className="bento-content flex-1 text-left">
                <Code2 className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className={`text-xl text-white mb-2 ${spaceGrotesk.className}`}>Declarative DSL</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Why drag and drop when you can type? Our custom Domain Specific Language lets you map out complex microservices as fast as you can think.
                </p>
              </div>
              <div className="flex-1 w-full max-w-[360px]">
                <div className="mock-editor-window text-left bg-[#08080a] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                  <div className="mock-editor-header flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04] bg-[#0c0c0f]">
                    <span className="editor-dot red w-2 h-2 rounded-full bg-[#ff5f56]" />
                    <span className="editor-dot yellow w-2 h-2 rounded-full bg-[#ffbd2e]" />
                    <span className="editor-dot green w-2 h-2 rounded-full bg-[#27c93f]" />
                    <span className="editor-badge font-mono text-[8px] text-slate-500 ml-auto bg-white/5 px-2 py-0.5 rounded">DSL</span>
                  </div>
                  <div className="mock-editor-code font-mono text-[11px] leading-relaxed p-4 text-slate-300">
                    <div><span className="text-[#f97583]">[</span><span className="text-[#79c0ff]">Auth Service</span><span className="text-[#f97583]">]</span> <span className="text-[#ff7b72]">→</span> <span className="text-[#f97583]">[</span><span className="text-[#79c0ff]">Database</span><span className="text-[#f97583]">]</span></div>
                    <div><span className="text-[#f97583]">[</span><span className="text-[#79c0ff]">API Gateway</span><span className="text-[#f97583]">]</span> <span className="text-[#ff7b72]">→</span> <span className="text-[#f97583]">[</span><span className="text-[#79c0ff]">Auth Service</span><span className="text-[#f97583]">]</span></div>
                    <div className="mt-3 text-[#10b981] text-[10px] flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Syntax valid
                    </div>
                  </div>
                </div>
              </div>
              <div className="bento-glow cyan-glow" />
            </div>

            {/* Bento Box 2: Instant Export */}
            <div className="bento-card bento-small border-glow-hover bg-slate-900/40">
              <div className="bento-content text-left">
                <FolderUp className="w-6 h-6 text-emerald-400 mb-4" />
                <h3 className={`text-lg text-white mb-2 ${spaceGrotesk.className}`}>High-Res Export</h3>
                <p className="text-sm text-slate-400">
                  Export to 3x resolution PNGs instantly. Ready for your documentation, PRs, or presentations.
                </p>
                <div className="mock-export-box mt-5 flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                    <span className="text-[11px] font-mono text-slate-300">diagram.png</span>
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">3x PNG</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                    <span className="text-[11px] font-mono text-slate-300">vector-flow.svg</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">SVG</span>
                  </div>
                </div>
              </div>
              <div className="bento-glow emerald-glow" />
            </div>

            {/* Bento Box 3: Smart Layouts */}
            <div className="bento-card bento-small border-glow-hover bg-slate-900/40">
              <div className="bento-content text-left">
                <Layers className="w-6 h-6 text-amber-400 mb-4" />
                <h3 className={`text-lg text-white mb-2 ${spaceGrotesk.className}`}>ELK.js Routing</h3>
                <p className="text-sm text-slate-400">
                  Zero overlapping wires. The mathematical layout engine automatically calculates the cleanest possible paths.
                </p>
                <div className="mock-routing-box mt-5 flex items-center justify-center p-3 border border-white/[0.04] bg-white/[0.01] rounded-xl h-[80px] overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:12px_12px]" />
                  <div className="flex items-center gap-6 z-10">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">UI</div>
                    <div className="relative w-12 h-6 flex items-center justify-center">
                      <div className="absolute w-full h-[1px] bg-amber-500/30" />
                      <div className="absolute w-2 h-2 rounded-full bg-amber-400/30 animate-ping" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">API</div>
                  </div>
                </div>
              </div>
              <div className="bento-glow amber-glow" />
            </div>

            {/* Bento Box 4: Clerk Security */}
            <div className="bento-card bento-large border-glow-hover bg-slate-900/40 flex flex-col md:flex-row items-center gap-6">
              <div className="bento-content flex-1 text-left">
                <Shield className="w-6 h-6 text-blue-400 mb-4" />
                <h3 className={`text-xl text-white mb-2 ${spaceGrotesk.className}`}>Enterprise-Grade Access</h3>
                <p className="text-sm text-slate-400">
                  Secured by Clerk authentication. Generate cryptographic 32-character hex tokens for read-only or collaborative sharing. Revoke access with a single click.
                </p>
              </div>
              <div className="flex-1 w-full max-w-[340px]">
                <div className="mock-sharing-panel bg-[#08080a] border border-white/[0.06] rounded-xl p-3.5 text-left shadow-xl">
                  <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Access Control</div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-bold">A</div>
                        <span className="text-[11px] font-semibold text-slate-200">Aryan (Owner)</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Full Access</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center text-[9px] font-bold">S</div>
                        <span className="text-[11px] font-semibold text-slate-200">Sarah (Collaborator)</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Editor</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="token_wbs_8f92ac410b" 
                      className="bg-white/[0.02] border border-white/5 rounded px-2 py-1 text-[10px] font-mono text-blue-400/80 flex-1 outline-none"
                    />
                    <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded px-2.5 py-1 text-[9px] font-semibold transition-all">Copy</button>
                  </div>
                </div>
              </div>
              <div className="bento-glow blue-glow" />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════ Mirai-Inspired Feature Grid ═══════ */}
      <section className="landing-section features-grid-sec" id="features">
        <div className="section-inner">

          <div className="section-header">
            <span className="section-label text-emerald-400">Capabilities</span>
            <h2 className={`section-title ${spaceGrotesk.className}`}>Fast. Offline-First. Algorithmic.</h2>
            <p className="section-desc">
              Engineered with modern tools to deliver instant results for software engineers and architects.
            </p>
          </div>

          <div className="features-grid-four">
            <div className="grid-feature-card border-glow-hover">
              <div className="feature-icon-box bg-cyan-500/10 border-cyan-500/20">
                <Cloud className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className={`feature-heading ${spaceGrotesk.className}`}>Cloud stays optional</h3>
              <p className="feature-text">
                Create and edit layouts locally in your browser. Sync up to secured databases whenever you want to collaborate or share publicly.
              </p>
            </div>

            <div className="grid-feature-card border-glow-hover">
              <div className="feature-icon-box bg-emerald-500/10 border-emerald-500/20">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className={`feature-heading ${spaceGrotesk.className}`}>Layouts get automated</h3>
              <p className="feature-text">
                No more aligning boxes manually. Advanced graph-drawing algorithms eliminate line overlaps instantly, giving you perfect topology.
              </p>
            </div>

            <div className="grid-feature-card border-glow-hover">
              <div className="feature-icon-box bg-blue-500/10 border-blue-500/20">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className={`feature-heading ${spaceGrotesk.className}`}>Privacy by default</h3>
              <p className="feature-text">
                Your prompt logs and custom schemas are stored securely. Generate share links with strict owner, collaborator, or read-only tokens.
              </p>
            </div>

            <div className="grid-feature-card border-glow-hover">
              <div className="feature-icon-box bg-amber-500/10 border-amber-500/20">
                <Code2 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className={`feature-heading ${spaceGrotesk.className}`}>Developer-first DSL</h3>
              <p className="feature-text">
                A highly intuitive domain-specific language represents nodes and connections. Write it directly or let our AI parse it from a single sentence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ Thrive-Inspired Vertical Tabs ═══════ */}
      <section className="landing-section tabs-showcase-sec" id="editor-showcase">
        <div className="section-inner">
          <div className="tabs-layout-grid">
            
            <div className="tabs-sidebar">
              <span className="section-label text-cyan-400" style={{ alignSelf: "flex-start" }}>Interactive Demo</span>
              <h2 className={spaceGrotesk.className} style={{ fontSize: "36px", marginBottom: "16px", color: "#fff" }}>
                Built for active collaboration
              </h2>
              
              <button 
                className={`tabs-btn ${activeTab === "collab" ? "active" : ""}`}
                onClick={() => setActiveTab("collab")}
              >
                <span className="tab-btn-title">Real-Time Sync</span>
                <span className="tab-btn-desc">Work side-by-side with colleagues using real-time broadcast channels.</span>
              </button>

              <button 
                className={`tabs-btn ${activeTab === "editor" ? "active" : ""}`}
                onClick={() => setActiveTab("editor")}
              >
                <span className="tab-btn-title">Dual-Pane Editor</span>
                <span className="tab-btn-desc">Write declarative architecture code or drag-and-drop elements on a visual canvas.</span>
              </button>

              <button 
                className={`tabs-btn ${activeTab === "caching" ? "active" : ""}`}
                onClick={() => setActiveTab("caching")}
              >
                <span className="tab-btn-title">Deterministic Caching</span>
                <span className="tab-btn-desc">Skip AI generation times completely with prompt hashes and similarity caching.</span>
              </button>
            </div>

            <div className="tabs-display">
              <div className="tab-display-header">
                <span className="preview-dot red" />
                <span className="preview-dot yellow" />
                <span className="preview-dot green" />
              </div>

              <div className="tab-display-body">
                {activeTab === "collab" && (
                  <div className="w-full">
                    <div className="cursor-demo-container">
                      <div className="simulated-cursor cursor-blue">
                        <Users className="w-3 h-3" /> Aryan (Owner)
                      </div>
                      <div className="simulated-cursor cursor-pink">
                        <Users className="w-3 h-3" /> Sarah (Editor)
                      </div>
                      <div className="simulated-cursor cursor-orange">
                        <Users className="w-3 h-3" /> Mike (Reader)
                      </div>
                    </div>
                    <p style={{ marginTop: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>
                      Live cursors and locks update in less than 50ms, showing exactly who is editing what node.
                    </p>
                  </div>
                )}

                {activeTab === "editor" && (
                  <div className="w-full text-left font-mono" style={{ fontSize: "13px", color: "#a1a1aa", background: "#060608", padding: "20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                    {/* <div style={{ color: "#71717a" }}>{"// Canvas changes synchronize in code pane automatically"}</div> */}
                    <div><span style={{ color: "#ff7b72" }}>[</span>Client Application<span style={{ color: "#ff7b72" }}>]</span> → <span style={{ color: "#ff7b72" }}>[</span>API Gateway<span style={{ color: "#ff7b72" }}>]</span></div>
                    <div><span style={{ color: "#ff7b72" }}>[</span>API Gateway<span style={{ color: "#ff7b72" }}>]</span> → <span style={{ color: "#ff7b72" }}>[</span>Auth Service<span style={{ color: "#ff7b72" }}>]</span></div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "14px", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
                      <Check className="w-4 h-4" /> Bi-directional parsing compiled successfully
                    </div>
                  </div>
                )}

                {activeTab === "caching" && (
                  <div className="caching-demo-box">
                    <div className="cache-pill">
                      <div className="cache-pill-label">
                        <span className="cache-indicator hit" />
                        <span>SHA-256 exact match</span>
                      </div>
                      <span className="cache-pill-status hit">Hit (0ms)</span>
                    </div>

                    <div className="cache-pill">
                      <div className="cache-pill-label">
                        <span className="cache-indicator similar" />
                        <span>85% String similarity</span>
                      </div>
                      <span className="cache-pill-status similar">Cached</span>
                    </div>

                    <div className="cache-pill">
                      <div className="cache-pill-label">
                        <span className="cache-indicator miss" />
                        <span>New prompt query</span>
                      </div>
                      <span className="cache-pill-status miss">AI Gen</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════ CTA Section ═══════ */}
      <section className="cta-sec">
        <div className="cta-glow-orb hero-orb-cyan opacity-20" />
        <div className="cta-content">
          <h2 className={`cta-title ${spaceGrotesk.className}`}>Ready to design your next backend?</h2>
          <p className="cta-desc">
            Describe your system architecture in plain English. Get high-quality, auto-formatted diagrams with live collaborative sharing instantly.
          </p>
          <Link href="/dashboard" className="pill-btn-white">
            Open Studio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════ Footer ═══════ */}
      <footer className="landing-footer border-t border-white/5">
        <div className="section-inner footer-flex">
          <div className="footer-left">
            <div className="footer-logo">W</div>
            <span className={`${spaceGrotesk.className}`} style={{ fontWeight: 700, color: "#fff" }}>Workbench Studio</span>
          </div>

          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#flowchart" className="footer-link">Pipeline</a>
            <a href="https://github.com/aryyann011/Workbench-Studio" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>

          <div className="text-slate-500 text-sm">
            &copy; 2026 Workbench Studio. MIT License.
          </div>
        </div>
      </footer>

    </div>
  )
}
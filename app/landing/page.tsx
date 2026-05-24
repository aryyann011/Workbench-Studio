"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
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
  Sparkles,
  Check
} from "lucide-react"
import "./landing.css"

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
    <div className="landing-root noise-overlay">
      
      {/* ═══════ Floating Header ═══════ */}
      <header className={`landing-header ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-pill">
          <Link href="/landing" className="logo-link">
            <div className="logo-symbol">W</div>
            <span className="logo-text">Workbench Studio</span>
          </Link>

          <nav className="nav-links">
            <a href="#features" className="nav-item">Features</a>
            <a href="#flowchart" className="nav-item">Pipeline</a>
            <a href="#editor-showcase" className="nav-item">Platform</a>
          </nav>

          <Link href="/" className="nav-cta-pill">
            Open Studio
          </Link>
        </div>
      </header>

      {/* ═══════ Hero Section ═══════ */}
      <section className="hero-sec mild-grid">
        <div className="hero-glow-container">
          <div className="hero-glow-orb hero-orb-blue" />
          <div className="hero-glow-orb hero-orb-pink" />
        </div>

        <div className="hero-badge-container">
          <span className="hero-badge-dot" />
          <span className="hero-badge-text">v1.2.0 • Real-Time Systems Architecture Designer</span>
        </div>

        <h1 className="hero-heading font-serif-header">
          Your system architecture starts here.
        </h1>

        <p className="hero-subheading">
          Stop drawing boxes manually. Describe your software system in plain text, and watch a structured interactive diagram build itself instantly.
        </p>

        <div className="hero-actions-container">
          <Link href="/" className="pill-btn-white">
            Start Designing <ArrowRight className="w-4 h-4" />
          </Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="pill-btn-outline"
          >
            <Github className="w-4 h-4" /> Star on GitHub
          </a>
        </div>

        {/* ═══════ Tilted Workbench Preview ═══════ */}
        <div className="isometric-preview-wrapper">
          <div className="isometric-container">
            <div className="preview-bar">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
              <span className="preview-tab-label">architecture.wbs</span>
            </div>
            
            <div className="preview-workspace-split">
              {/* Left Pane: Monaco Code View */}
              <div className="preview-editor-pane">
                <div className="editor-line">
                  <span className="line-num">1</span>
                  <span className="line-code"><span className="syntax-comment">// Workbench Architecture DSL</span></span>
                </div>
                <div className="editor-line">
                  <span className="line-num">2</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Client Application</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">API Gateway</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">3</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">API Gateway</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Auth Service</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">4</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">API Gateway</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Collaboration Engine</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">5</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Auth Service</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Collaboration Engine</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">6</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Collaboration Engine</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Event Queue</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">7</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Event Queue</span><span className="syntax-bracket">]</span>
                    <span className="syntax-arrow"> → </span>
                    <span className="syntax-bracket">[</span><span className="syntax-node">Background Processor</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
                <div className="editor-line">
                  <span className="line-num">8</span>
                  <span className="line-code">
                    <span className="syntax-bracket">[</span><span className="syntax-node">Client Application</span><span className="syntax-bracket">]</span>
                    <span className="syntax-keyword"> inside </span>
                    <span className="syntax-bracket">[</span><span className="syntax-group">Client Phase</span><span className="syntax-bracket">]</span>
                  </span>
                </div>
              </div>

              {/* Right Pane: Diagram View */}
              <div className="preview-canvas-pane">
                <div className="preview-canvas-grid" />
                
                <div className="mini-diagram-container">
                  <div className="mini-diagram-row">
                    <div className="mini-node active-glow">
                      <span className="mini-node-icon">📱</span>
                      <div className="mini-node-details">
                        <span className="mini-node-title">Client Application</span>
                        <span className="mini-node-tag">CLIENT</span>
                      </div>
                    </div>
                    <div className="mini-node">
                      <span className="mini-node-icon">⚙️</span>
                      <div className="mini-node-details">
                        <span className="mini-node-title">API Gateway</span>
                        <span className="mini-node-tag">API ENDPOINT</span>
                      </div>
                    </div>
                  </div>

                  <div className="mini-diagram-row">
                    <div className="mini-node">
                      <span className="mini-node-icon">🛡️</span>
                      <div className="mini-node-details">
                        <span className="mini-node-title">Auth Service</span>
                        <span className="mini-node-tag">SERVICE</span>
                      </div>
                    </div>
                    <div className="mini-node">
                      <span className="mini-node-icon">📦</span>
                      <div className="mini-node-details">
                        <span className="mini-node-title">Collab Engine</span>
                        <span className="mini-node-tag">COMPONENT</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative connection lines in mockup */}
                  <svg className="mini-arrow-svg" viewBox="0 0 400 300">
                    <path d="M180 50 Q 220 50 250 50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" markerEnd="url(#arrow)" />
                    <path d="M290 80 Q 200 130 180 170" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                    <path d="M180 200 Q 250 200 290 200" fill="none" stroke="rgba(58,134,255,0.4)" strokeWidth="2" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Technology Stack Brands ═══════ */}
        <div className="trust-bar section-inner">
          <div className="trust-title">POWERED BY LEADING TECHNOLOGY STACK</div>
          <div className="trust-flex">
            <span className="trust-item"><span className="trust-item-symbol">▲</span> Next.js 16</span>
            <span className="trust-item"><span className="trust-item-symbol">◆</span> Gemini 2.5 Flash</span>
            <span className="trust-item"><span className="trust-item-symbol">⬡</span> ReactFlow</span>
            <span className="trust-item"><span className="trust-item-symbol">⚡</span> Supabase Realtime</span>
            <span className="trust-item"><span className="trust-item-symbol">◎</span> ELK.js Layout</span>
            <span className="trust-item"><span className="trust-item-symbol">💎</span> Prisma ORM</span>
          </div>
        </div>
      </section>

      {/* ═══════ Native Flowchart Section ═══════ */}
      <section className="landing-section flowchart-sec mild-grid" id="flowchart">
        <div className="section-inner">
          
          <div className="section-header">
            <span className="section-label">Pipeline Architecture</span>
            <h2 className="section-title font-serif-header">Designed by builders, built automatically</h2>
            <p className="section-desc">
              Understand the standard data flow of systems generated inside Workbench Studio. The compiler maps commands directly into visual phases.
            </p>
          </div>

          <div className="flowchart-diagram-container">
            {/* Phase 1: Client, Routing, Security */}
            <div className="flowchart-row-three">
              
              <div className="flowchart-phase-group" data-phase="Client Phase">
                <div className="flowchart-card phase-client" id="card-client-app">
                  <div className="card-icon-wrapper">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Client Application</span>
                    <span className="card-subtitle">Client</span>
                  </div>
                  <span className="connector-dot right" />
                </div>
              </div>

              <div className="flowchart-phase-group" data-phase="Routing Phase">
                <div className="flowchart-card phase-routing" id="card-api-gateway">
                  <div className="card-icon-wrapper">
                    <Server className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">API Gateway</span>
                    <span className="card-subtitle">API Endpoint</span>
                  </div>
                  <span className="connector-dot left" />
                  <span className="connector-dot right" />
                  <span className="connector-dot bottom" />
                </div>
              </div>

              <div className="flowchart-phase-group" data-phase="Security Phase">
                <div className="flowchart-card phase-security" id="card-auth-service">
                  <div className="card-icon-wrapper">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Auth Service</span>
                    <span className="card-subtitle">Service</span>
                  </div>
                  <span className="connector-dot left" />
                  <span className="connector-dot bottom" />
                </div>
              </div>

            </div>

            {/* Phase 2: Processing Phase */}
            <div className="flowchart-phase-group" data-phase="Processing Phase">
              <div className="flowchart-row-processing">
                
                <div className="flowchart-card phase-processing" id="card-collab-engine" style={{ flex: 1.2 }}>
                  <div className="card-icon-wrapper">
                    <Layers className="w-5 h-5 text-pink-500" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Collaboration Engine</span>
                    <span className="card-subtitle">Component</span>
                  </div>
                  <span className="connector-dot top" />
                  <span className="connector-dot right" />
                  <span className="connector-dot bottom" />
                </div>

                <div className="flowchart-card phase-processing" id="card-event-queue" style={{ flex: 1 }}>
                  <div className="card-icon-wrapper">
                    <Mail className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Event Queue</span>
                    <span className="card-subtitle">Message Queue</span>
                  </div>
                  <span className="connector-dot left" />
                  <span className="connector-dot right" />
                </div>

                <div className="flowchart-card phase-processing" id="card-bg-processor" style={{ flex: 1.2 }}>
                  <div className="card-icon-wrapper">
                    <Play className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Background Processor</span>
                    <span className="card-subtitle">Service</span>
                  </div>
                  <span className="connector-dot left" />
                  <span className="connector-dot bottom" />
                </div>

              </div>
            </div>

            {/* Phase 3: Storage Phase */}
            <div className="flowchart-row-storage">
              
              <div className="flowchart-phase-group" data-phase="Storage Phase">
                <div className="flowchart-card phase-storage" id="card-data-layer">
                  <div className="card-icon-wrapper">
                    <Settings className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Data Access Layer</span>
                    <span className="card-subtitle">Component</span>
                  </div>
                  <span className="connector-dot top" />
                  <span className="connector-dot right" />
                </div>
              </div>

              <div className="flowchart-phase-group" data-phase="Storage Phase">
                <div className="flowchart-card phase-storage" id="card-primary-db">
                  <div className="card-icon-wrapper">
                    <Database className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Primary Database</span>
                    <span className="card-subtitle">Database</span>
                  </div>
                  <span className="connector-dot top" />
                  <span className="connector-dot left" />
                </div>
              </div>

              <div className="flowchart-phase-group" data-phase="Storage Phase">
                <div className="flowchart-card phase-storage" id="card-object-store">
                  <div className="card-icon-wrapper">
                    <FolderUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="card-meta">
                    <span className="card-title">Object Storage</span>
                    <span className="card-subtitle">Component</span>
                  </div>
                  <span className="connector-dot top" />
                  <span className="connector-dot left" />
                </div>
              </div>

            </div>

            {/* Connecting lines drawn via SVG paths overlay */}
            <svg className="flowchart-connectors-overlay">
              {/* Row 1 horizontal connections */}
              <path d="M 330 90 L 390 90" />
              <path d="M 700 90 L 760 90" />
              
              {/* Vertical API Gateway to Collab Engine */}
              <path d="M 545 110 L 545 190" />

              {/* Security Phase down to Collab Engine / Primary Database */}
              <path d="M 915 110 L 915 220 L 590 220" />
              <path d="M 915 220 L 915 320 C 915 480, 580 480, 580 500" />

              {/* Processing row horizontal connections */}
              <path d="M 430 252 L 490 252" />
              <path d="M 740 252 L 800 252" />

              {/* Processing to Storage down connections */}
              <path d="M 280 280 L 280 340" />
              <path d="M 960 280 L 960 340" />

              {/* Data Access Layer connections in Row 3 */}
              <path d="M 380 410 L 440 410" />
              <path d="M 280 435 L 280 470 L 800 470 L 800 440" />
            </svg>

          </div>

        </div>
      </section>

      {/* ═══════ Mirai-Inspired Feature Grid ═══════ */}
      <section className="landing-section features-grid-sec" id="features">
        <div className="section-inner">

          <div className="section-header">
            <span className="section-label">Capabilities</span>
            <h2 className="section-title font-serif-header">Fast. Offline-First. Algorithmic.</h2>
            <p className="section-desc">
              Engineered with modern tools to deliver instant results for software engineers and architects.
            </p>
          </div>

          <div className="features-grid-four">
            
            <div className="grid-feature-card">
              <div className="feature-icon-box">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="feature-heading">Cloud stays optional</h3>
              <p className="feature-text">
                Create and edit layouts locally in your browser. Sync up to clerk-secured databases whenever you want to collaborate or share publicly.
              </p>
            </div>

            <div className="grid-feature-card">
              <div className="feature-icon-box">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="feature-heading">Layouts get automated</h3>
              <p className="feature-text">
                No more aligning boxes manually. ELK.js layout engine implements advanced graph-drawing algorithms to eliminate line overlaps instantly.
              </p>
            </div>

            <div className="grid-feature-card">
              <div className="feature-icon-box">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="feature-heading">Privacy by default</h3>
              <p className="feature-text">
                Your prompt logs and custom schemas are stored securely. Generate share links with strict owner, collaborator, or read-only tokens.
              </p>
            </div>

            <div className="grid-feature-card">
              <div className="feature-icon-box">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="feature-heading">Developer-first DSL</h3>
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
            
            {/* Left side tabs select */}
            <div className="tabs-sidebar">
              <span className="section-label" style={{ alignSelf: "flex-start" }}>Interactive Demo</span>
              <h2 className="font-serif-header" style={{ fontSize: "36px", marginBottom: "16px" }}>
                Built for active collaboration
              </h2>
              
              <button 
                className={`tabs-btn ${activeTab === "collab" ? "active" : ""}`}
                onClick={() => setActiveTab("collab")}
              >
                <span className="tab-btn-title">Real-Time Sync</span>
                <span className="tab-btn-desc">Work side-by-side with colleagues using Supabase broadcast channels.</span>
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

            {/* Right side visual display */}
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
                    <div style={{ color: "#71717a" }}>{"// Canvas changes synchronize in code pane automatically"}</div>
                    <div><span style={{ color: "#ff7b72" }}>[</span>Client Application<span style={{ color: "#ff7b72" }}>]</span> → <span style={{ color: "#ff7b72" }}>[</span>API Gateway<span style={{ color: "#ff7b72" }}>]</span></div>
                    <div><span style={{ color: "#ff7b72" }}>[</span>API Gateway<span style={{ color: "#ff7b72" }}>]</span> → <span style={{ color: "#ff7b72" }}>[</span>Auth Service<span style={{ color: "#ff7b72" }}>]</span></div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#27c93f", marginTop: "14px", fontFamily: "var(--font-sans)", fontWeight: 600 }}>
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
        <div className="cta-glow-orb" />
        <div className="cta-content">
          <h2 className="cta-title font-serif-header">Ready to design your next backend?</h2>
          <p className="cta-desc">
            Describe your system architecture in plain English. Get high-quality, auto-formatted diagrams with live collaborative sharing instantly.
          </p>
          <Link href="/" className="pill-btn-white">
            Open Studio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════ Footer ═══════ */}
      <footer className="landing-footer">
        <div className="section-inner footer-flex">
          <div className="footer-left">
            <div className="footer-logo">W</div>
            <span style={{ fontWeight: 700, color: "#fff" }}>Workbench Studio</span>
          </div>

          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#flowchart" className="footer-link">Pipeline</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>

          <div>
            &copy; 2026 Workbench Studio. MIT License.
          </div>
        </div>
      </footer>

    </div>
  )
}

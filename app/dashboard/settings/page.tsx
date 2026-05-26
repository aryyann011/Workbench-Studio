import { currentUser } from "@clerk/nextjs/server";
import { User, Sliders, KeyRound } from "lucide-react";

export default async function SettingsPage() {
  const user = await currentUser();

  return (
    <div className="p-8 w-full max-w-4xl mx-auto text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Settings</h1>
        <p className="text-muted-foreground">Configure your profile, editor defaults, and API keys.</p>
      </div>

      <div className="space-y-8">
        {user && (
          <div className="border border-border bg-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">User Account</h2>
            </div>
            
            <div className="flex items-center gap-6">
              <img 
                src={user.imageUrl} 
                alt={user.fullName || "User Profile"} 
                className="w-16 h-16 rounded-full border-2 border-neutral-800"
              />
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{user.fullName || "Developer"}</h3>
                <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Developer Account
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border border-border bg-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <Sliders className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Workspace Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300">Default Layout Engine</label>
              <select className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2.5 text-sm focus:border-neutral-500 focus:ring-0 transition-colors">
                <option>ELK.js (Sugiyama Layout)</option>
                <option>ELK.js (Force Directed)</option>
                <option>ReactFlow Custom (Spring)</option>
              </select>
              <p className="text-xs text-muted-foreground">Adjust layout algorithm to minimize edge crossings.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300">Default Diagram Theme</label>
              <select className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2.5 text-sm focus:border-neutral-500 focus:ring-0 transition-colors" defaultValue="black">
                <option value="slate">Dark Slate (#0f172a)</option>
                <option value="black">Proper Black (#000000)</option>
                <option value="zinc">Deep Zinc (#09090b)</option>
              </select>
              <p className="text-xs text-muted-foreground">Set the background palette for your active canvas.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300">Image Export Resolution</label>
              <select className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2.5 text-sm focus:border-neutral-500 focus:ring-0 transition-colors" defaultValue="3x">
                <option>1x (Standard)</option>
                <option>2x (Retina)</option>
                <option value="3x">3x (Ultra HD Vector Equivalent)</option>
              </select>
              <p className="text-xs text-muted-foreground">Sets the pixel density scale for downloaded PNG files.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300">Auto-Save Delay</label>
              <select className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2.5 text-sm focus:border-neutral-500 focus:ring-0 transition-colors" defaultValue="2s">
                <option>Instant (500ms)</option>
                <option value="2s">Default (2 seconds)</option>
                <option>Manual (Ctrl+S only)</option>
              </select>
              <p className="text-xs text-muted-foreground">Wait time before automatically saving local canvas modifications.</p>
            </div>
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Gemini AI Model Key</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-900">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Default Model Config</h4>
                <p className="text-xs text-muted-foreground font-mono">Gemini 2.5 Flash API Key (Shared Tier)</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300">Custom API Token (Optional)</label>
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2.5 text-sm focus:border-neutral-500 focus:ring-0 transition-colors font-mono"
                disabled
              />
              <p className="text-xs text-muted-foreground">Override the default shared API key with your own Google AI key to bypass limits.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

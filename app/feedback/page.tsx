"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Space_Grotesk, Inter } from "next/font/google";
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Star } from "lucide-react";
import { ModeToggle } from "@/components/Mode/modeToggle";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function FeedbackPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please enter your feedback message.");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, rating }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || "Failed to submit feedback.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${inter.className}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
              W
            </div>
            <span className={`font-bold ${spaceGrotesk.className}`}>Workbench Studio</span>
          </Link>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-xl">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="bg-card border border-border shadow-2xl shadow-black/5 dark:shadow-black/40 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />

            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${spaceGrotesk.className}`}>
                We Value Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Feedback</span>
              </h1>
              <p className="text-muted-foreground">
                Help us improve Workbench Studio. Whether it's a bug, feature request, or just saying hello!
              </p>
            </div>

            {isSuccess ? (
              <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${spaceGrotesk.className}`}>Thank You!</h3>
                <p className="text-muted-foreground mb-8">
                  Your feedback has been successfully submitted. We appreciate your input to make Workbench Studio better.
                </p>
                <button 
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage("");
                    setRating(0);
                  }}
                  className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium transition-colors"
                >
                  Submit Another Response
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">How would you rate your experience?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoveredRating || rating) 
                              ? "fill-amber-400 text-amber-400" 
                              : "text-muted-foreground/30 dark:text-muted-foreground/50"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
                    Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-foreground"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-foreground"
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-4 bg-foreground text-background rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Send Feedback 
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

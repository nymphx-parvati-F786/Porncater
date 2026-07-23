import { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Send, ShieldAlert, Zap } from "lucide-react";
import SearchBar from "@/src/components/ui/SearchBar";
import {
  Play, User, Flame, Clock, Sparkles,
  MonitorPlay, Star, ThumbsUp, Filter,
  TrendingUp, Menu, Search, Video
} from "lucide-react";
import SmartHeader from "@/src/components/ui/SmartHeader";

// =========================================================
// 🚀 SEO METADATA
// =========================================================
export const metadata: Metadata = {
  title: 'Contact Us | PornCater',
  description: 'Get in touch with the PornCater support team for advertising, technical issues, or general inquiries.',
  alternates: {
    canonical: 'https://porncater.com/contact',
  },
};

export default function ContactPage() {
  const megaCategories = [
    "BBC", "Lesbian", "Cuckold", "Blowjob", "Creampie", "MILF", "Teen",
    "Anal", "Threesome", "Interracial", "Amateur", "BDSM", "POV",
    "Asian", "Ebony", "Latina", "Big Tits", "Cosplay", "Vintage", "VR"
  ];
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-rose-900 selection:text-white pb-20 flex flex-col">

      {/* 🔥 THE NEW SLIDING SMART HEADER */}
      <SmartHeader categories={megaCategories} />

      {/* Main Content */}
      <main className="flex-grow max-w-[1200px] mx-auto px-6 w-full pt-16 pb-24">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4 text-rose-800">
            <Mail size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light text-white tracking-wide mb-4">
            Get in Touch
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto font-light leading-relaxed tracking-wide">
            Have a question about advertising, need technical support, or want to partner with PornCater? Send us a message and our team will get back to you within 24-48 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left Column: Contact Info & DMCA Warning */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-sm">
              <h3 className="text-lg font-serif italic text-white mb-6 flex items-center gap-3">
                <MessageSquare size={18} className="text-rose-800" /> General Inquiries
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                For the fastest response, please ensure you select the correct subject line in the contact form. We do not accept unsolicited content submissions via email.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 w-24">Email</span>
                  <a href="mailto:support@porncater.com" className="hover:text-rose-500 transition-colors">support@porncater.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 w-24">Response</span>
                  <span>1 - 2 Business Days</span>
                </div>
              </div>
            </div>

            {/* DMCA Routing Box - CRITICAL FOR TUBE SITES */}
            <div className="bg-[#1a0a0a] border border-rose-900/30 p-8 rounded-sm">
              <h3 className="text-lg font-serif italic text-rose-500 mb-4 flex items-center gap-3">
                <ShieldAlert size={18} /> DMCA / Copyright
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                Do not use this form for copyright infringement claims. To ensure compliance with the Digital Millennium Copyright Act (DMCA), all takedown notices must be routed through our official legal portal.
              </p>
              <Link href="/dmca" className="inline-block border border-rose-800 text-rose-500 px-6 py-2.5 rounded-sm text-[11px] uppercase tracking-widest font-semibold hover:bg-rose-900/20 transition-all duration-300">
                Go to DMCA Portal
              </Link>
            </div>

          </div>

          {/* Right Column: The Contact Form */}
          <div className="lg:col-span-3">
            <form className="bg-zinc-900/20 border border-white/5 p-8 sm:p-10 rounded-sm flex flex-col gap-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 text-white text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 text-white text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all appearance-none cursor-pointer"
                >
                  <option value="general">General Inquiry</option>
                  <option value="advertising">Advertising & Partnerships</option>
                  <option value="technical">Technical Support / Bug Report</option>
                  <option value="feedback">Site Feedback</option>
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="How can we help you today?"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all placeholder:text-zinc-700 resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-4 flex items-center justify-center gap-2 w-full sm:w-auto self-start bg-rose-800 hover:bg-rose-700 text-white px-8 py-3.5 rounded-sm text-[11px] uppercase tracking-widest font-bold transition-all duration-300 shadow-[0_0_15px_rgba(159,18,57,0.4)] hover:shadow-[0_0_25px_rgba(159,18,57,0.6)]"
              >
                Send Message <Send size={14} />
              </button>

              <p className="text-[10px] text-zinc-600 mt-2">
                By submitting this form, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          </div>

        </div>
      </main>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="border-t border-zinc-900 pt-16 pb-12 text-center bg-[#050505]">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-10 text-[11px] uppercase tracking-widest text-zinc-500 font-bold px-4">
          <Link href="/dmca" className="hover:text-zinc-300 transition">DMCA / Copyright</Link>
          <Link href="/privacy-policy" className="hover:text-zinc-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="text-rose-700 hover:text-rose-500 transition">Terms of Service</Link>
          <Link href="/2257" className="hover:text-zinc-300 transition">18 U.S.C. 2257</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition">Contact Us</Link>
        </div>

        <div className="text-xl tracking-widest mb-4">
          <span className="font-serif italic text-rose-800 pr-1">Porn</span>
          <span className="font-light text-zinc-600">Cater</span>
        </div>
        <p className="text-zinc-600 text-[10px] uppercase font-semibold tracking-widest max-w-3xl mx-auto px-6 leading-relaxed mb-6">
          All models appearing on this website were 18 years or older at the time of production. PornCater has a zero-tolerance policy against illegal pornography. By entering this site you swear that you are of legal age in your area to view adult material and that you wish to view such material.
        </p>
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} PornCater.com • Free Sex Tube • 18+ Only
        </p>
      </footer>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";

export default function ReportButton({ videoId }: { videoId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/videos/${videoId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setFormData({ reason: "", description: "", email: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Report failed to submit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* The Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 rounded-sm border border-zinc-800 text-zinc-400 hover:border-rose-800/50 hover:text-rose-500 transition-all duration-300 text-[11px] uppercase tracking-widest"
      >
        <Flag size={16} strokeWidth={1.5} /> Report
      </button>

      {/* The Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-sm shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#050505]">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle size={18} />
                <h3 className="text-sm uppercase tracking-widest font-bold">Report Content</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-800/50">
                    <Flag className="text-rose-500" size={24} />
                  </div>
                  <h4 className="text-white font-serif italic text-xl mb-2">Report Received</h4>
                  <p className="text-zinc-400 text-xs tracking-wide font-light">Our compliance team will review this video within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-zinc-400 text-xs font-light leading-relaxed mb-4">
                    PornCater maintains a zero-tolerance policy against illegal content. If you believe this video violates our terms, please select a reason below.
                  </p>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Reason for Report</label>
                    <select 
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full bg-[#030303] border border-zinc-800 text-white text-sm rounded-sm p-3 focus:outline-none focus:border-rose-800 transition-colors"
                    >
                      <option value="" disabled>Select a reason...</option>
                      <option value="Underage / CSAM">Underage Performer / CSAM</option>
                      <option value="Non-Consensual">Non-Consensual Content</option>
                      <option value="Copyright / DMCA">Copyright / DMCA Violation</option>
                      <option value="Violence / Illegal Acts">Violence or Illegal Acts</option>
                      <option value="Broken Video">Broken or Spam Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Additional Details (Optional)</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-[#030303] border border-zinc-800 text-white text-sm rounded-sm p-3 focus:outline-none focus:border-rose-800 transition-colors resize-none"
                      placeholder="Please provide specific timestamps or details..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Your Email (For Follow-up)</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#030303] border border-zinc-800 text-white text-sm rounded-sm p-3 focus:outline-none focus:border-rose-800 transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2.5 text-[11px] uppercase tracking-widest font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-rose-800 hover:bg-rose-700 text-white px-6 py-2.5 rounded-sm text-[11px] uppercase tracking-widest font-semibold transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
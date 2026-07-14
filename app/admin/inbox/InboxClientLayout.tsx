"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, Scale, ShieldCheck, 
  Terminal, Clock, Reply, Inbox, Search, 
  Trash2, UserCircle2, MailOpen
} from "lucide-react";

interface SerializedMessage {
  id: number;
  to: string;
  from: string;
  subject: string;
  body: string;
  isHtml: boolean;
  isRead: boolean;
  isTrashed: boolean;
  createdAt: string;
}

export default function InboxClientLayout({ initialMessages }: { initialMessages: SerializedMessage[] }) {
  const [messages, setMessages] = useState<SerializedMessage[]>(initialMessages || []);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 🛡️ BULLETPROOF PARSER: Prevents crashes if sender is malformed or missing
  const parseSender = (rawFrom: string) => {
    if (!rawFrom) return { name: "Unknown System", email: "noreply@system" };
    const match = rawFrom.match(/(.*)<(.*)>/);
    if (match) {
      const cleanName = match[1].replace(/"/g, '').trim(); // Strips weird quotes
      return { name: cleanName || match[2].trim(), email: match[2].trim() };
    }
    return { name: rawFrom.split("@")[0], email: rawFrom };
  };

  // 🎬 THE GMAIL SECRET SAUCE: Injects modern typography safely
  const renderCinematicHtml = (rawHtml: string) => {
    const html = rawHtml || ""; // 🛡️ Prevents crash if body is empty
    const defaultStyles = `
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          color: #1a1a1a;
          line-height: 1.6;
          margin: 0;
          padding: 24px 32px;
          background: #ffffff;
          word-wrap: break-word;
          -webkit-font-smoothing: antialiased;
        }
        img, video, iframe {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 4px;
          margin-top: 8px;
        }
        table { max-width: 100% !important; border-collapse: collapse; }
        a { color: #1a73e8; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
      </style>
    `;

    if (html.toLowerCase().includes('<head>')) {
      return html.replace(/<head>/i, `<head>\n${defaultStyles}`);
    }
    return `<!DOCTYPE html><html><head>${defaultStyles}</head><body>${html}</body></html>`;
  };

  const activeMessage = messages.find((m) => m.id === activeId);

  // Safe Filtering
  const filteredMessages = messages.filter((msg) => {
    if (filter === "trash" && !msg.isTrashed) return false;
    if (filter !== "trash" && msg.isTrashed) return false;
    if (filter !== "all" && filter !== "trash" && !(msg.to || "").toLowerCase().includes(filter.toLowerCase())) return false;

    const search = searchQuery.toLowerCase();
    return (
      (msg.subject || "").toLowerCase().includes(search) ||
      (msg.from || "").toLowerCase().includes(search)
    );
  });

  const handleMarkAsRead = async (id: number) => {
    setActiveId(id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.isRead) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      await fetch(`/api/admin/inbox/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true })
      }).catch(console.error); // 🛡️ Catch background network failures
    }
  };

  const handleToggleTrash = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    const newTrashState = !msg.isTrashed;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isTrashed: newTrashState } : m));
    if (activeId === id) setActiveId(null); 

    await fetch(`/api/admin/inbox/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isTrashed: newTrashState })
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-light">
            <span className="font-serif italic text-rose-800 pr-0.5">Porn</span>Cater
          </Link>
          <span className="text-[10px] font-mono text-zinc-600 uppercase border border-zinc-800/60 px-2 py-0.5 bg-zinc-900/30 rounded-sm">
            Admin Mailbox
          </span>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-white/5 bg-[#030303] p-4 flex flex-col gap-1.5 shrink-0">
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2 mt-2">Mailboxes</div>
          <button onClick={() => setFilter("all")} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition ${filter === "all" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/40"}`}>
            <div className="flex items-center gap-3"><Inbox size={14} /> Inbox</div>
            <span className="text-[10px] bg-rose-900/40 text-rose-300 px-1.5 py-0.5 rounded-full">{messages.filter(m => !m.isRead && !m.isTrashed).length || ""}</span>
          </button>
          <button onClick={() => setFilter("dmca")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition ${filter === "dmca" ? "bg-zinc-900 text-rose-400" : "text-zinc-400 hover:bg-zinc-900/40"}`}>
            <ShieldAlert size={14} /> DMCA Takedowns
          </button>
          
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2 mt-6">System</div>
          <button onClick={() => setFilter("trash")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition ${filter === "trash" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/40"}`}>
            <Trash2 size={14} /> Recycle Bin
          </button>
        </aside>

        {/* LIST PANE */}
        <section className="w-[400px] border-r border-white/5 bg-[#070707] flex flex-col shrink-0">
          <div className="p-4 border-b border-white/5 bg-[#070707]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-zinc-600" size={14} />
              <input 
                type="text" 
                placeholder="Search mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/5 rounded-sm pl-9 pr-4 py-2 text-xs text-zinc-300 focus:border-zinc-700 outline-none transition"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.02]">
            {filteredMessages.map((msg) => {
              const sender = parseSender(msg.from);
              return (
                <div
                  key={msg.id}
                  onClick={() => handleMarkAsRead(msg.id)}
                  className={`p-4 cursor-pointer text-left transition group ${activeId === msg.id ? "bg-zinc-900/80" : "hover:bg-zinc-900/40"} ${!msg.isRead ? "bg-white/[0.02]" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {!msg.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                      <span className={`text-xs truncate ${!msg.isRead ? "text-zinc-100 font-semibold" : "text-zinc-400 font-medium"}`}>
                        {sender.name}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleToggleTrash(msg.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-500 transition shrink-0"
                    >
                      {msg.isTrashed ? <MailOpen size={14} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                  <h4 className={`text-xs truncate mb-1 pr-6 ${!msg.isRead ? "text-zinc-200 font-medium" : "text-zinc-500 font-light"}`}>
                    {msg.subject || "(No Subject)"}
                  </h4>
                </div>
              );
            })}
          </div>
        </section>

        {/* 🎬 READING PANE - FULL BLEED MODERN LAYOUT */}
        <main className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">
          {activeMessage ? (
            <div className="flex flex-col h-full w-full">
              
              {/* Sleek, Light-Mode Email Header */}
              <div className="p-8 pb-6 border-b border-zinc-200 bg-[#fbfbfb] shrink-0 shadow-sm z-10">
                <h2 className="text-3xl text-zinc-900 font-light mb-6 tracking-tight">
                  {activeMessage.subject || "(No Subject)"}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCircle2 size={40} strokeWidth={1} className="text-zinc-400" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {parseSender(activeMessage.from).name}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        &lt;{parseSender(activeMessage.from).email}&gt;
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs bg-white px-3 py-1.5 rounded-md border border-zinc-200 shadow-sm">
                    <Clock size={12} />
                    <span>{new Date(activeMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Edge-to-Edge Email Body Sandbox */}
              <div className="flex-1 w-full h-full bg-white relative">
                {activeMessage.isHtml ? (
                  <iframe 
                    srcDoc={renderCinematicHtml(activeMessage.body)}
                    className="absolute inset-0 w-full h-full border-none"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                    title="Rich Email Viewer"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full p-8 md:p-12 text-[15px] text-zinc-800 whitespace-pre-wrap overflow-y-auto bg-white font-sans leading-relaxed">
                    {activeMessage.body || ""}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-[#f9f9f9]">
              <Inbox size={56} strokeWidth={1} className="mb-4 opacity-30" />
              <p className="text-sm font-medium tracking-wide">Select a transmission to decrypt</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
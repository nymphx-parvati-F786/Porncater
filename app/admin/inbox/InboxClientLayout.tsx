"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Mail, ShieldAlert, Scale, ShieldCheck,
    Terminal, User, Clock, Reply, Inbox, Search
} from "lucide-react";

interface SerializedMessage {
    id: number;
    to: string;
    from: string;
    subject: string;
    body: string;
    createdAt: string;
}

export default function InboxClientLayout({
    initialMessages
}: {
    initialMessages: SerializedMessage[]
}) {
    const [messages] = useState<SerializedMessage[]>(initialMessages);
    const [activeId, setActiveId] = useState<number | null>(
        initialMessages.length > 0 ? initialMessages[0].id : null
    );
    const [filter, setFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Select the active message body object based on state selection
    const activeMessage = messages.find((m) => m.id === activeId);

    // Filter messages dynamically based on left sidebar categories or search queries
    const filteredMessages = messages.filter((msg) => {
        const matchesFilter = filter === "all" || msg.to.toLowerCase().includes(filter.toLowerCase());
        const matchesSearch =
            msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.body.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Helper to dynamically color-code administrative routing tags
    const getInboxBadge = (toField: string) => {
        const address = toField.toLowerCase();
        if (address.includes("dmca")) return "border-rose-900/50 bg-rose-950/20 text-rose-400";
        if (address.includes("legal")) return "border-amber-900/50 bg-amber-950/20 text-amber-400";
        if (address.includes("privacy")) return "border-blue-900/50 bg-blue-950/20 text-blue-400";
        if (address.includes("compliance")) return "border-purple-900/50 bg-purple-950/20 text-purple-400";
        return "border-zinc-800 bg-zinc-900/50 text-zinc-400";
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans flex flex-col selection:bg-rose-900 selection:text-white">

            {/* Top Console Navigation Bar */}
            <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-2xl tracking-widest font-light hover:opacity-80 transition">
                        <span className="font-serif italic text-rose-800 pr-0.5">Porn</span>Cater
                    </Link>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase border border-zinc-800/60 px-2 py-0.5 bg-zinc-900/30 rounded-sm">
                        Admin Console v2.6
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium tracking-wider uppercase text-zinc-400">
                    <Link href="/admin/upload" className="hover:text-white transition">Uploads</Link>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                    <span className="text-rose-700">Inbox Control</span>
                </div>
            </header>

            {/* Main Workspace Frame */}
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">

                {/* SIDEBAR A: Main Category Toggles */}
                <aside className="w-64 border-r border-white/5 bg-[#030303] p-4 flex flex-col gap-1.5 shrink-0">
                    <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2 mt-2">
                        Routing Gateways
                    </div>

                    <button
                        onClick={() => setFilter("all")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition current ${filter === "all" ? "bg-zinc-900 text-white border-l-2 border-rose-800" : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"}`}
                    >
                        <Inbox size={14} /> All Channels
                    </button>

                    <button
                        onClick={() => setFilter("dmca")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition ${filter === "dmca" ? "bg-rose-950/20 text-rose-400 border-l-2 border-rose-800" : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"}`}
                    >
                        <ShieldAlert size={14} /> DMCA Takedowns
                    </button>

                    <button
                        onClick={() => setFilter("legal")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition ${filter === "legal" ? "bg-amber-950/20 text-amber-400 border-l-2 border-amber-800" : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"}`}
                    >
                        <Scale size={14} /> Legal / ToS
                    </button>

                    <button
                        onClick={() => setFilter("privacy")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition ${filter === "privacy" ? "bg-blue-950/20 text-blue-400 border-l-2 border-blue-800" : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"}`}
                    >
                        <ShieldCheck size={14} /> Privacy / GDPR
                    </button>
                </aside>

                {/* SIDEBAR B: Live Stream Message Feed List */}
                <section className="w-[380px] border-r border-white/5 bg-[#070707] flex flex-col shrink-0 overflow-y-auto">

                    {/* Internal Quick Search Bar */}
                    <div className="p-4 border-b border-white/5 sticky top-0 bg-[#070707] z-10">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 text-zinc-600" size={14} />
                            <input
                                type="text"
                                placeholder="Query subject, sender..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/60 border border-white/5 rounded-sm pl-9 pr-4 py-2 text-xs font-light text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-rose-950 transition"
                            />
                        </div>
                    </div>

                    {/* List Index */}
                    <div className="flex-1 divide-y divide-white/[0.02]">
                        {filteredMessages.length > 0 ? (
                            filteredMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => setActiveId(msg.id)}
                                    className={`p-4 cursor-pointer text-left transition select-none relative ${activeId === msg.id ? "bg-zinc-900/60" : "hover:bg-zinc-900/20"}`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="text-[11px] font-mono text-zinc-500 max-w-[180px] truncate">
                                            {msg.from}
                                        </span>
                                        <span className={`text-[8px] font-mono tracking-widest uppercase border px-1.5 py-0.5 rounded-sm shrink-0 ${getInboxBadge(msg.to)}`}>
                                            {msg.to.split("@")[0]}
                                        </span>
                                    </div>
                                    <h4 className={`text-xs font-medium truncate mb-1 ${activeId === msg.id ? "text-white" : "text-zinc-300"}`}>
                                        {msg.subject || "(No Subject)"}
                                    </h4>
                                    <p className="text-[11px] font-light text-zinc-500 line-clamp-2 leading-relaxed">
                                        {msg.body}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-zinc-600 text-xs italic font-light">
                                No matching telemetry found.
                            </div>
                        )}
                    </div>
                </section>

                {/* COMPONENT VIEW PANE: Active Transmission Display Matrix */}
                <main className="flex-1 bg-black flex flex-col overflow-y-auto">
                    {activeMessage ? (
                        <div className="flex flex-col flex-1 p-8 md:p-12">

                            {/* Telemetry Header Meta */}
                            <div className="border-b border-white/5 pb-6 mb-8">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-rose-700 block mb-1">
                                            Subject
                                        </span>
                                        <h2 className="text-xl md:text-2xl font-serif italic text-white tracking-wide">
                                            {activeMessage.subject || "(No Subject Provided)"}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono uppercase bg-zinc-900/30 border border-zinc-900 px-3 py-1.5 rounded-sm">
                                        <Clock size={12} />
                                        <span>{new Date(activeMessage.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-[#030303] border border-white/5 rounded-sm p-4 font-mono text-[11px]">
                                    <div>
                                        <span className="text-zinc-600 block text-[9px] uppercase tracking-widest mb-0.5">Origin Node</span>
                                        <span className="text-zinc-300 block truncate select-text">{activeMessage.from}</span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-600 block text-[9px] uppercase tracking-widest mb-0.5">Target Destination</span>
                                        <span className="text-rose-400 block font-medium truncate">{activeMessage.to}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Message Payload Body Box (Upgraded Rich HTML Engine) */}
                            <div className="flex-1 bg-white rounded-sm overflow-hidden flex flex-col border border-white/10 mt-6 relative shadow-2xl">
                                {activeMessage.body.trim().startsWith("<") || activeMessage.body.includes("html>") ? (
                                    /* 🎬 CINEMATIC HTML RENDERER: Quarantines their styles so it doesn't break your dark mode */
                                    <iframe
                                        srcDoc={activeMessage.body}
                                        className="w-full h-full flex-1 border-none bg-white"
                                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                        title="Email Viewer"
                                    />
                                ) : (
                                    /* 📝 FALLBACK PLAIN TEXT RENDERER */
                                    <div className="flex-1 p-6 md:p-8 text-sm text-zinc-800 font-medium leading-relaxed whitespace-pre-wrap select-text bg-[#f9f9f9] overflow-y-auto">
                                        {activeMessage.body}
                                    </div>
                                )}
                            </div>

                            {/* Secure Administrative Reply Interface Draft Box */}
                            <div className="mt-8 border-t border-white/5 pt-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Reply size={14} className="text-zinc-500" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-medium">
                                        Secure Outbound Intercept Gateway
                                    </span>
                                </div>
                                <div className="relative rounded-sm border border-white/5 bg-[#030303] overflow-hidden focus-within:border-zinc-700 transition">
                                    <textarea
                                        placeholder={`Draft formal document clearance response to ${activeMessage.from}...`}
                                        rows={4}
                                        className="w-full bg-transparent resize-none p-4 text-xs font-light font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none"
                                    />
                                    <div className="border-t border-white/5 px-4 py-2.5 bg-black/40 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-600 uppercase">
                                            <Terminal size={12} /> TLS Encrypted Connection Required
                                        </div>
                                        <button
                                            onClick={() => alert("Ready for Outbound Engine activation.")}
                                            className="bg-zinc-100 hover:bg-white text-black text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-sm transition"
                                        >
                                            Transmit Response
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-600">
                            <Terminal size={40} strokeWidth={1} className="mb-4 text-zinc-800" />
                            <p className="text-xs font-mono tracking-wider uppercase">Console System Standby</p>
                            <p className="text-[11px] font-light mt-1 text-zinc-700 max-w-xs">
                                Select an active database notification node from the dashboard registry to query full legal metadata.
                            </p>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}
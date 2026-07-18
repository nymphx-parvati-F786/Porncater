"use client";

import { useState, useEffect } from "react";
import { Mail, Star, Send, Trash2, Paperclip, Clock, Reply, X } from "lucide-react";

type Email = {
  id: number;
  subject: string;
  fromName: string | null;
  fromEmail: string;
  textBody: string | null;
  isRead: boolean;
  receivedAt: string;
  hasAttachments: boolean;
};

export default function InboxClientLayout() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullEmailData, setFullEmailData] = useState<any>(null);

  // --- COMPOSE STATE ---
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/inbox")
      .then((res) => res.json())
      .then((data) => {
        setEmails(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // Helper to make ugly plain HTML emails look modern and sexy
  const getFormattedHtml = (rawHtml: string) => {
    return `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #111827;
          padding: 24px;
          margin: 0;
        }
        img { max-width: 100% !important; height: auto !important; border-radius: 8px; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
      ${rawHtml}
    `;
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/admin/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          textBody: composeBody,
        }),
      });

      if (res.ok) {
        setIsComposing(false);
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");
      } else {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    setComposeTo(selectedEmail.fromEmail);
    setComposeSubject(`Re: ${selectedEmail.subject}`);
    setComposeBody(`\n\n\n--- On ${new Date(selectedEmail.receivedAt).toLocaleString()}, ${selectedEmail.fromName || selectedEmail.fromEmail} wrote:\n> ${selectedEmail.textBody?.split('\n').join('\n> ') || ''}`);
    setIsComposing(true);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 font-sans relative">

      {/* 1. SIDEBAR */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight mb-6">Mailbox</h2>
          <button 
            onClick={() => {
              setComposeTo(""); setComposeSubject(""); setComposeBody(""); setIsComposing(true);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Compose
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium bg-red-600/10 text-red-500 rounded-md">
            <Mail className="w-4 h-4 mr-3" /> Inbox
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium hover:bg-gray-800 rounded-md transition-colors">
            <Star className="w-4 h-4 mr-3" /> Starred
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium hover:bg-gray-800 rounded-md transition-colors">
            <Send className="w-4 h-4 mr-3" /> Sent
          </button>
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium hover:bg-gray-800 rounded-md transition-colors">
            <Trash2 className="w-4 h-4 mr-3" /> Trash
          </button>
        </nav>
      </div>

      {/* 2. EMAIL LIST */}
      <div className="w-96 bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-semibold text-gray-100">Inbox</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your sexy inbox...</div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                onClick={async () => {
                  setSelectedEmail(email);
                  setFullEmailData(null);
                  try {
                    const res = await fetch(`/api/admin/inbox/${email.id}`);
                    const data = await res.json();
                    setFullEmailData(data);
                  } catch (err) { console.error(err); }

                  if (!email.isRead) {
                    try {
                      await fetch(`/api/admin/inbox/${email.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isRead: true })
                      });
                      setEmails(emails.map(e => e.id === email.id ? { ...e, isRead: true } : e));
                    } catch (err) { console.error(err); }
                  }
                }}
                className={`p-4 border-b border-gray-800/50 cursor-pointer transition-colors ${selectedEmail?.id === email.id ? "bg-gray-800" : "hover:bg-gray-900"} ${!email.isRead ? "bg-gray-900/50" : ""}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm truncate pr-2 ${!email.isRead ? "font-bold text-white" : "text-gray-300"}`}>
                    {email.fromName || email.fromEmail}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(email.receivedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-200 truncate mb-1">{email.subject}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{email.textBody || "No text content"}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. READING PANE */}
      <div className="flex-1 bg-gray-950 flex flex-col overflow-hidden">
        {selectedEmail ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-gray-800 shrink-0">
              <h1 className="text-2xl font-bold text-white mb-6">{selectedEmail.subject}</h1>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold">
                    {(selectedEmail.fromName || selectedEmail.fromEmail).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-200">{selectedEmail.fromName || selectedEmail.fromEmail}</div>
                    <div className="text-sm text-gray-500">{"<"}{selectedEmail.fromEmail}{">"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {selectedEmail.hasAttachments && <Paperclip className="w-4 h-4" />}
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedEmail.receivedAt).toLocaleString()}
                  </span>
                  {/* NEW: Reply Button */}
                  <button onClick={handleReply} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
                    <Reply className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch(`/api/admin/inbox/${selectedEmail.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isTrashed: true })
                      });
                      setEmails(emails.filter(e => e.id !== selectedEmail.id));
                      setSelectedEmail(null);
                    }}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {!fullEmailData ? (
                <div className="text-gray-500 animate-pulse flex items-center gap-2">
                  <Mail className="w-5 h-5 opacity-50" /> Loading sexy content...
                </div>
              ) : fullEmailData.htmlBody ? (
                <iframe
                  srcDoc={getFormattedHtml(fullEmailData.htmlBody)}
                  title="Email Content"
                  className="w-full h-full min-h-200 bg-white rounded-md shadow-inner"
                  sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              ) : (
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed max-w-4xl">
                  {fullEmailData.textBody || "No content provided."}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <Mail className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a message to read</p>
          </div>
        )}
      </div>

      {/* 4. THE COMPOSE OVERLAY (GOD TIER) */}
      {isComposing && (
        <div className="absolute bottom-0 right-12 w-150 h-137.5 bg-gray-900 border border-gray-700 rounded-t-xl shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
            <h3 className="font-semibold text-white">New Message</h3>
            <button onClick={() => setIsComposing(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="To" 
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              className="w-full bg-transparent border-b border-gray-700 pb-2 text-white outline-none focus:border-red-500 transition-colors"
            />
            <input 
              type="text" 
              placeholder="Subject" 
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              className="w-full bg-transparent border-b border-gray-700 pb-2 text-white outline-none focus:border-red-500 transition-colors"
            />
            <textarea 
              placeholder="Write your message..."
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              className="flex-1 w-full bg-transparent text-gray-200 outline-none resize-none pt-2"
            />
          </div>
          <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
            <button 
              onClick={handleSendEmail}
              disabled={isSending || !composeTo || !composeBody}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
            <button onClick={() => setIsComposing(false)} className="text-gray-500 hover:text-gray-300">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Mail, Star, Send, Trash2, Paperclip, Clock, Reply, X, ArchiveRestore } from "lucide-react";

type Email = {
  id: number;
  subject: string;
  fromName: string | null;
  fromEmail: string;
  textBody: string | null;
  isRead: boolean;
  isStarred: boolean;
  receivedAt: string;
  hasAttachments: boolean;
};

type FolderType = "inbox" | "starred" | "sent" | "trash";

export default function InboxClientLayout() {
  const [currentFolder, setCurrentFolder] = useState<FolderType>("inbox");
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullEmailData, setFullEmailData] = useState<any>(null);

  // Compose State
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch emails whenever the folder changes
  useEffect(() => {
    setLoading(true);
    setSelectedEmail(null);
    setFullEmailData(null);

    fetch(`/api/admin/inbox?folder=${currentFolder}`)
      .then((res) => res.json())
      .then((data) => {
        setEmails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentFolder]);

  // CSS Helper for the Sidebar
  const getNavBtnClass = (folder: FolderType) => {
    return currentFolder === folder
      ? "flex items-center w-full px-4 py-2 text-sm font-medium bg-red-600/10 text-red-500 rounded-md"
      : "flex items-center w-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-md transition-colors";
  };

  const getFormattedHtml = (rawHtml: string) => {
    return `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #111827; padding: 24px; margin: 0; }
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
        const data = await res.json();
        setIsComposing(false);
        setComposeTo("");
        setComposeSubject("");
        setComposeBody("");

        // If you are currently in the "Sent" folder, make it pop up instantly!
        if (currentFolder === "sent" && data.message) {
          setEmails([data.message, ...emails]);
        }
      } else {
        const errData = await res.json();
        console.error("Failed to send email:", errData);
        alert("Failed to send: " + (errData.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Network error while sending email.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = () => {
    if (!selectedEmail) return;

    setComposeTo(selectedEmail.fromEmail);
    setComposeSubject(
      selectedEmail.subject.startsWith("Re:")
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`
    );

    // Safely parse the original text without crashing if it's purely HTML!
    const originalText = selectedEmail.textBody
      ? selectedEmail.textBody.split('\n').map(line => `> ${line}`).join('\n')
      : "> (HTML email content)";

    setComposeBody(`\n\n\n--- On ${new Date(selectedEmail.receivedAt).toLocaleString()}, ${selectedEmail.fromName || selectedEmail.fromEmail} wrote:\n${originalText}`);

    setIsComposing(true); // Pops open the God-Tier compose window
  };

  // Toggle Star Status instantly
  const toggleStar = async (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    const newStatus = !email.isStarred;

    // Optimistic UI update
    setEmails(emails.map(em => em.id === email.id ? { ...em, isStarred: newStatus } : em));
    if (selectedEmail?.id === email.id) setSelectedEmail({ ...selectedEmail, isStarred: newStatus });

    // Update DB
    await fetch(`/api/admin/inbox/${email.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStarred: newStatus })
    });
  };

  // Move to trash or Restore from trash
  const toggleTrash = async (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    const isNowTrashed = currentFolder !== "trash"; // If we aren't in trash, clicking this trashes it.

    // Remove from current view instantly
    setEmails(emails.filter(em => em.id !== email.id));
    setSelectedEmail(null);

    // Update DB
    await fetch(`/api/admin/inbox/${email.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTrashed: isNowTrashed })
    });
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 font-sans relative">

      {/* 1. SIDEBAR */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight mb-6">Mailbox</h2>
          <button
            onClick={() => { setComposeTo(""); setComposeSubject(""); setComposeBody(""); setIsComposing(true); }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Compose
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setCurrentFolder("inbox")} className={getNavBtnClass("inbox")}>
            <Mail className="w-4 h-4 mr-3" /> Inbox
          </button>
          <button onClick={() => setCurrentFolder("starred")} className={getNavBtnClass("starred")}>
            <Star className="w-4 h-4 mr-3" /> Starred
          </button>
          <button onClick={() => setCurrentFolder("sent")} className={getNavBtnClass("sent")}>
            <Send className="w-4 h-4 mr-3" /> Sent
          </button>
          <button onClick={() => setCurrentFolder("trash")} className={getNavBtnClass("trash")}>
            <Trash2 className="w-4 h-4 mr-3" /> Trash
          </button>
        </nav>
      </div>

      {/* 2. EMAIL LIST */}
      <div className="w-100 bg-gray-950 border-r border-gray-800 flex flex-col shrink-0 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="font-semibold text-gray-100 capitalize">{currentFolder}</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
              <Mail className="w-6 h-6 animate-pulse" /> Loading...
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Nothing here baby!</div>
          ) : (
            emails.map((email) => (
              <div
                key={email.id}
                onClick={async () => {
                  setSelectedEmail(email);
                  setFullEmailData(null);
                  try {
                    const res = await fetch(`/api/admin/inbox/${email.id}`);
                    setFullEmailData(await res.json());
                  } catch (err) { console.error(err); }

                  if (!email.isRead && currentFolder !== "sent") {
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
                className={`group p-4 border-b border-gray-800/50 cursor-pointer transition-colors ${selectedEmail?.id === email.id ? "bg-gray-800" : "hover:bg-gray-900"} ${!email.isRead ? "bg-gray-900/50" : ""}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {/* Star Icon directly in the list! */}
                    <button onClick={(e) => toggleStar(e, email)} className="focus:outline-none shrink-0">
                      <Star className={`w-4 h-4 ${email.isStarred ? "fill-yellow-500 text-yellow-500" : "text-gray-600 group-hover:text-gray-400"}`} />
                    </button>
                    <span className={`text-sm truncate ${!email.isRead ? "font-bold text-white" : "text-gray-300"}`}>
                      {email.fromName || email.fromEmail}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">
                    {new Date(email.receivedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-200 truncate mb-1 pl-6">{email.subject}</div>
                <div className="text-xs text-gray-500 line-clamp-2 pl-6">{email.textBody || "No text content"}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. READING PANE */}
      <div className="flex-1 bg-gray-950 flex flex-col overflow-hidden min-w-0">
        {selectedEmail ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-gray-800 shrink-0">
              <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                {selectedEmail.subject}
                <button onClick={(e) => toggleStar(e, selectedEmail)} className="focus:outline-none">
                  <Star className={`w-6 h-6 ${selectedEmail.isStarred ? "fill-yellow-500 text-yellow-500" : "text-gray-700 hover:text-gray-400"}`} />
                </button>
              </h1>
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
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {selectedEmail.hasAttachments && <Paperclip className="w-4 h-4 mr-2" />}
                  <Clock className="w-4 h-4" />
                  <span className="mr-4">{new Date(selectedEmail.receivedAt).toLocaleString()}</span>

                  {/* Reply Button */}
                  <button onClick={handleReply} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors" title="Reply">
                    <Reply className="w-5 h-5" />
                  </button>

                  {/* Smart Trash/Restore Button */}
                  <button
                    onClick={(e) => toggleTrash(e, selectedEmail)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-md transition-colors"
                    title={currentFolder === "trash" ? "Restore to Inbox" : "Move to Trash"}
                  >
                    {currentFolder === "trash" ? <ArchiveRestore className="w-5 h-5 text-green-500" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {!fullEmailData ? (
                <div className="text-gray-500 animate-pulse flex items-center gap-2">
                  <Mail className="w-5 h-5 opacity-50" /> Loading sexy content...
                </div>
              ) : (
                <iframe
                  srcDoc={getFormattedHtml(
                    fullEmailData.htmlBody ||
                    `<div style="white-space: pre-wrap;">${fullEmailData.textBody || "No content provided."}</div>`
                  )}
                  title="Email Content"
                  className="w-full h-full min-h-200 bg-white rounded-md shadow-inner"
                  sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
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
        <div className="absolute bottom-0 right-12 w-[600px] h-[550px] bg-gray-900 border border-gray-700 rounded-t-xl shadow-2xl flex flex-col overflow-hidden z-50">
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
              placeholder="Write your sexy message..."
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
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw, Sparkles } from "lucide-react";

const BASE_URL ="http://localhost:5000";

const QUICK_PROMPTS = [
  { icon: "📈", text: "What is Bitcoin halving?"           },
  { icon: "💼", text: "How to diversify crypto portfolio?" },
  { icon: "🔍", text: "What is DeFi?"                     },
  { icon: "⚠️", text: "How to manage crypto risk?"        },
  { icon: "🪙", text: "Explain Ethereum vs Bitcoin"        },
  { icon: "📊", text: "What are crypto market indicators?" },
];

/* ── Message Bubble ── */
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
        isUser ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white" : "bg-gradient-to-br from-orange-400 to-pink-500 text-white"
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
        }`}>
          {msg.text.split("\n").map((line, i) => {
            const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            return <p key={i} dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />;
          })}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
      </div>
    </div>
  );
}

/* ── Typing Indicator ── */
function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white flex items-center justify-center flex-shrink-0">
        <Bot size={14} />
      </div>
      <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/* ── Main Chat ── */
export default function AiChat() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "👋 Hi! I'm **CryptoAI**, your personal crypto assistant!\n\nAsk me anything about:\n• Market analysis & trends 📈\n• Portfolio advice 💼\n• Crypto concepts & education 📚\n• Risk management tips ⚠️\n\nLet's go! 🚀",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", text, time }]);
    setInput("");
    setLoading(true);

    const newHistory = [...history, { role: "user", parts: [{ text }] }];

    try {
      // ✅ Call backend — API key is safe on server
      const res  = await fetch(`${BASE_URL}/api/ai/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: newHistory }),
      });

      const data  = await res.json();
      const reply = data.reply || "Sorry, I couldn't process that. Please try again! 🙏";
      const aiTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setMessages(prev => [...prev, { role: "assistant", text: reply, time: aiTime }]);
      setHistory([...newHistory, { role: "model", parts: [{ text: reply }] }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "⚠️ Something went wrong. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      text: "🗑️ Chat cleared! Ask me anything about crypto. 🚀",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setHistory([]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 30%, #f0fdf4 60%, #fef9f0 100%)" }}>

      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-6 flex flex-col h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-pink-600 text-transparent bg-clip-text">
                CryptoAI Assistant
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs text-gray-400 font-medium">Powered by Google Gemini</p>
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            className="p-2.5 rounded-xl bg-white/80 border border-white/60 shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition text-gray-400">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex gap-2 flex-wrap mb-4">
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q.text)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white/80 backdrop-blur-sm border border-white/60 text-gray-600 px-3 py-1.5 rounded-xl shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition">
              <span>{q.icon}</span>{q.text}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-4 mb-4" style={{ minHeight: 0 }}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-3 flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about crypto... (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 resize-none placeholder-gray-400 leading-relaxed"
            style={{ maxHeight: "120px" }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
            <Send size={15} />
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-2">
          ⚠️ CryptoAI provides educational information only. Always DYOR before investing.
        </p>

      </div>
    </div>
  );
}

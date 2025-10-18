import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";

function MessageBubble({ m, meId }) {
  const fromMe = m.fromUserId === meId || m.fromMe;
  return (
    <div className={`flex ${fromMe ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm border shadow-sm ${
        fromMe ? "bg-white border-slate-200" : "bg-brand-50 border-brand-200"
      }`}>
        <div className="whitespace-pre-wrap text-slate-800">{m.text}</div>
        <div className="text-[10px] text-slate-500 mt-1 text-left">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const { threadId } = useParams();
  const qc = useQueryClient();
  // simple me id from token mock
  const meId = 3; // client test in seed

  const { data: threads = [] } = useQuery({
    queryKey: ["threads", meId],
    queryFn: () => Api.getChatThreads(meId),
  });

  const currentThreadId = threadId || threads[0]?.id;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", currentThreadId],
    queryFn: () => Api.getThreadMessages(currentThreadId),
    enabled: Boolean(currentThreadId),
  });

  const [text, setText] = useState("");
  const listRef = useRef(null);

  const send = useMutation({
    mutationFn: (payload) => Api.sendMessage(currentThreadId, payload),
    onSuccess: (created) => {
      qc.setQueryData(["messages", currentThreadId], (prev = []) => [...prev, created]);
      qc.setQueryData(["threads", meId], (prev = []) => prev.map((t) => t.id === currentThreadId ? { ...t, lastMessage: created.text, updatedAt: created.createdAt } : t));
    },
  });

  useEffect(() => {
    // autoscroll on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages?.length]);

  const thread = useMemo(() => threads.find((t) => t.id === currentThreadId), [threads, currentThreadId]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!text.trim()) return;
      const optimistic = {
        id: `tmp-${Date.now()}`,
        threadId: currentThreadId,
        fromUserId: meId,
        text,
        createdAt: new Date().toISOString(),
        read: false,
      };
      qc.setQueryData(["messages", currentThreadId], (prev = []) => [...prev, optimistic]);
      setText("");
      send.mutate({ text, fromUserId: meId });
    }
  };

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4" dir="rtl">
      {/* Sidebar */}
      <aside className="rounded-2xl border bg-white p-3 shadow-sm h-[70vh] overflow-auto">
        <div className="text-sm text-slate-600 mb-2">الدردشات</div>
        <div className="space-y-2">
          {threads.map((t) => (
            <a href={`/chat/${t.id}`} key={t.id} className={`block rounded-xl border p-2 hover:bg-slate-50 ${t.id === currentThreadId ? "border-brand-300 bg-brand-50" : "border-slate-200"}`}>
              <div className="text-sm font-medium text-slate-900">{t.peer.name}</div>
              <div className="text-xs text-slate-600 line-clamp-1">{t.lastMessage}</div>
            </a>
          ))}
          {threads.length === 0 && (
            <div className="text-xs text-slate-500">لا توجد محادثات بعد</div>
          )}
        </div>
      </aside>

      {/* Conversation */}
      <section className="rounded-2xl border bg-white shadow-sm h-[70vh] flex flex-col">
        <header className="flex items-center justify-between border-b p-3">
          <div>
            <div className="text-sm text-slate-900 font-medium">{thread?.peer?.name || "محادثة"}</div>
            <div className="text-xs text-slate-500">متصل الآن</div>
          </div>
        </header>
        <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2 bg-slate-50/40">
          {isLoading && <div className="text-sm text-slate-500">جارٍ التحميل…</div>}
          {!isLoading && messages.map((m) => (
            <MessageBubble key={m.id} m={m} meId={meId} />
          ))}
        </div>
        <footer className="p-3 border-t">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="اكتب رسالة…"
              className="flex-1 resize-none rounded-2xl border border-slate-300 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            />
            <button
              onClick={() => {
                if (!text.trim()) return;
                const optimistic = {
                  id: `tmp-${Date.now()}`,
                  threadId: currentThreadId,
                  fromUserId: meId,
                  text,
                  createdAt: new Date().toISOString(),
                  read: false,
                };
                qc.setQueryData(["messages", currentThreadId], (prev = []) => [...prev, optimistic]);
                setText("");
                send.mutate({ text, fromUserId: meId });
              }}
              className="px-4 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            >
              إرسال
            </button>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Enter للإرسال — Shift+Enter لسطر جديد</div>
        </footer>
      </section>
    </div>
  );
}

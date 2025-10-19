import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { showErrorOnce } from "../api/http";
import toast from "react-hot-toast";

function MessageBubble({ m, meId, onRetry }) {
  const fromMe = m.fromUserId === meId || m.fromMe;
  const failed = Boolean(m.failed);
  return (
    <div className={`flex ${fromMe ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm border shadow-sm ${
        failed ? "bg-danger-50 border-danger-300" : fromMe ? "bg-white border-slate-200" : "bg-brand-50 border-brand-200"
      }`}>
        <div className="whitespace-pre-wrap text-slate-800">{m.text}</div>
        <div className="text-[10px] text-slate-500 mt-1 text-left">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        {failed && (
          <div className="mt-1 text-[10px] text-danger-600 flex items-center gap-2">
            <span>فشل الإرسال</span>
            <button
              type="button"
              onClick={() => onRetry?.(m)}
              className="px-2 py-0.5 rounded-lg border border-danger-300 text-danger-700 hover:bg-danger-100"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
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

  const { data: messages = [], isLoading, isFetching } = useQuery({
    queryKey: ["messages", currentThreadId],
    queryFn: () => Api.getThreadMessages(currentThreadId),
    enabled: Boolean(currentThreadId),
    // Light polling when no websocket
    refetchInterval: 6000,
  });

  const [text, setText] = useState("");
  const listRef = useRef(null);

  const send = useMutation({
    mutationFn: (payload) => Api.sendMessage(currentThreadId, payload),
    onSuccess: (created) => {
      qc.setQueryData(["messages", currentThreadId], (prev = []) => {
        const copy = Array.isArray(prev) ? [...prev] : [];
        // Replace the last optimistic tmp message if present
        let replaced = false;
        for (let i = copy.length - 1; i >= 0; i--) {
          if (String(copy[i]?.id || "").startsWith("tmp-")) {
            copy[i] = created;
            replaced = true;
            break;
          }
        }
        return replaced ? copy : [...copy, created];
      });
      qc.setQueryData(["threads", meId], (prev = []) => prev.map((t) => t.id === currentThreadId ? { ...t, lastMessage: created.text, updatedAt: created.createdAt } : t));
    },
    onError: () => {
      showErrorOnce("تعذر إرسال الرسالة", "send-fail");
      // Mark last optimistic as failed for retry UI
      qc.setQueryData(["messages", currentThreadId], (prev = []) => {
        const copy = [...prev];
        for (let i = copy.length - 1; i >= 0; i--) {
          const it = copy[i];
          if (it && String(it.id).startsWith("tmp-")) {
            copy[i] = { ...it, failed: true };
            break;
          }
        }
        return copy;
      });
    }
  });

  useEffect(() => {
    // autoscroll on new messages
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages?.length]);

  const thread = useMemo(() => threads.find((t) => t.id === currentThreadId), [threads, currentThreadId]);

  const retrySend = (failedMsg) => {
    if (!failedMsg?.text) return;
    // Unmark failed optimistically to avoid double error text
    qc.setQueryData(["messages", currentThreadId], (prev = []) => {
      const copy = [...prev];
      const idx = copy.findIndex((x) => x.id === failedMsg.id);
      if (idx !== -1) copy[idx] = { ...copy[idx], failed: false };
      return copy;
    });
    send.mutate({ text: failedMsg.text, fromUserId: meId });
  };

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

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4">
      <div className="grid gap-4 md:grid-cols-[260px_1fr]" dir="rtl">
      {/* Sidebar */}
      <aside className={`rounded-2xl border bg-white p-3 shadow-sm h-[70vh] overflow-auto ${showSidebar ? "block" : "hidden md:block"}`}>
        <div className="text-sm text-slate-600 mb-2">الدردشات</div>
        <div className="space-y-2">
          {(Array.isArray(threads) ? threads : []).map((t) => (
            <a href={`/chat/${t.id}`} key={t.id} className={`block rounded-xl border p-2 hover:bg-slate-50 ${t.id === currentThreadId ? "border-brand-300 bg-brand-50" : "border-slate-200"}`}>
              <div className="text-sm font-medium text-slate-900">{t.peer.name}</div>
              <div className="text-xs text-slate-600 line-clamp-1">{t.lastMessage}</div>
            </a>
          ))}
          {(Array.isArray(threads) ? threads.length : 0) === 0 && (
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
          <button
            className="md:hidden px-3 py-1.5 rounded-xl border text-sm"
            onClick={() => setShowSidebar((v) => !v)}
          >
            {showSidebar ? "إخفاء القائمة" : "إظهار القائمة"}
          </button>
        </header>
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-slate-50/40 max-h-[calc(100vh-220px)]">
          {isLoading && (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-2/3 rounded-xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </>
          )}
          {!isLoading && (Array.isArray(messages) ? messages : []).map((m) => (
            <MessageBubble key={m.id} m={m} meId={meId} onRetry={retrySend} />
          ))}
          {/* typing indicator when fetching new messages */}
          {!isLoading && isFetching && (
            <div className="inline-flex items-center gap-1 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
              <span>يكتب…</span>
            </div>
          )}
          {/* failed bubble */}
          {!isLoading && (Array.isArray(messages) ? messages : []).some((m) => m.failed) && (
            <div className="text-xs text-red-600">فشل إرسال رسالة. حاول مجدداً.</div>
          )}
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
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Api } from "../api/endpoints";
import { showErrorOnce } from "../api/http";
import { useAuthStore } from "../stores/auth";
import { useChatThreads, normalizeThread } from "../hooks/useChatThreads";
import {
  filterUnread,
  mergeUniqueMessages,
  normalizeMessage,
  normalizeMessages,
  sortMessagesAsc,
} from "../lib/chat";
import { getEcho } from "../lib/echo";
import { useNoticeStore } from "../stores/notifications";

function normId(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function getMeId() {
  const u = useAuthStore.getState()?.user;
  return u?.id ?? undefined;
}

function MessageBubble({ m, meId, peerName, onRetry }) {
  const fromMe = (meId != null && m.fromUserId === meId) || m.fromMe;
  const failed = Boolean(m.failed);
  const senderLabel = fromMe ? "أنت" : m.senderName ?? peerName ?? "مستخدم";

  const timeStr = m.createdAt
    ? new Date(m.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`flex ${fromMe ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm border shadow-sm ${
          failed
            ? "bg-danger-50 border-danger-300"
            : fromMe
            ? "bg-white border-slate-200"
            : "bg-brand-50 border-brand-200"
        }`}
      >
        <div className="text-[11px] text-slate-500 mb-1 font-medium text-right">
          {senderLabel}
        </div>
        <div className="whitespace-pre-wrap text-slate-800 text-right">
          {m.text || ""}
        </div>
        {timeStr && (
          <div className="text-[10px] text-slate-500 mt-1 text-left">
            {timeStr}
          </div>
        )}
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

  const user = useAuthStore((s) => s.user);
  const meId = getMeId() ?? 0;
  const myName =
    user?.full_name ?? user?.fullName ?? user?.name ?? user?.email ?? "أنا";

  const incrementUnread = useNoticeStore((s) => s.incrementThreadUnread);
  const clearThreadUnread = useNoticeStore((s) => s.clearThreadUnread);
  const setThreadUnread = useNoticeStore((s) => s.setThreadUnread);

  const {
    data: threadsData = [],
    isLoading: threadsLoading,
    isError: threadsError,
  } = useChatThreads(meId);

  const threads = useMemo(
    () => (Array.isArray(threadsData) ? threadsData : []),
    [threadsData]
  );

  const firstId = threads[0]?.id;
  const currentThreadId = normId(threadId ?? firstId);

  const [text, setText] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const listRef = useRef(null);
  const activeThreadRef = useRef(currentThreadId);
  useEffect(() => {
    activeThreadRef.current = currentThreadId;
  }, [currentThreadId]);

  const messagesQuery = useQuery({
    queryKey: ["messages", currentThreadId],
    queryFn: () => Api.getThreadMessages(currentThreadId),
    enabled: !!currentThreadId,
    refetchOnWindowFocus: false,
    staleTime: 10_000,
    select: (res) => {
      const threadRaw = res?.thread ?? res?.data?.thread ?? null;
      const messagesPayload =
        res?.messages ?? res?.data?.messages ?? res?.data ?? res ?? [];
      return {
        thread: threadRaw ? normalizeThread(threadRaw) : null,
        messages: sortMessagesAsc(normalizeMessages(messagesPayload)),
      };
    },
    onError: () => showErrorOnce("تعذر تحميل الرسائل", "messages-load"),
    onSuccess: (bundle) => {
      if (bundle?.thread) {
        qc.setQueryData(["threads", meId], (prev = []) => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          const idx = arr.findIndex(
            (t) => String(t.id) === String(bundle.thread.id)
          );
          if (idx >= 0) arr[idx] = { ...arr[idx], ...bundle.thread };
          else arr.unshift(bundle.thread);
          return arr;
        });
      }
    },
  });

  const messageBundle = messagesQuery.data ?? { messages: [] };
  const rawMessages = messageBundle.messages;
  const messages = useMemo(
    () => rawMessages ?? [],
    [rawMessages]
  );
  const threadFromShow = messageBundle.thread;

  const thread = useMemo(() => {
    if (threadFromShow) return threadFromShow;
    if (!currentThreadId) return undefined;
    return threads.find((t) => normId(t.id) === currentThreadId);
  }, [threadFromShow, threads, currentThreadId]);

  const peerName =
    thread?.peer?.fullName ??
    thread?.peer?.full_name ??
    thread?.peer?.name ??
    thread?.peerName ??
    "محادثة";

  const markQueueRef = useRef(new Set());

  const markRead = useMutation({
    mutationFn: ({ messageId }) => Api.markMessageRead(messageId),
    onSuccess: (res, variables) => {
      const normalized = normalizeMessage(res?.message ?? res);
      const { messageId, threadId } = variables;
      qc.setQueryData(["messages", threadId], (prev) => {
        const bundle = prev || { messages: [] };
        const next = bundle.messages.map((msg) =>
          String(msg.id) === String(messageId)
            ? { ...msg, readAt: normalized.readAt ?? new Date().toISOString() }
            : msg
        );
        return { ...bundle, messages: next };
      });
      qc.setQueryData(["threads", meId], (prev = []) =>
        prev.map((t) =>
          String(t.id) === String(threadId)
            ? { ...t, unreadCount: 0 }
            : t
        )
      );
      clearThreadUnread(threadId);
    },
    onSettled: (_res, _err, variables) => {
      markQueueRef.current.delete(`${variables.threadId}:${variables.messageId}`);
    },
  });

  const unreadMessages = useMemo(
    () => filterUnread(messages, meId),
    [messages, meId]
  );

  useEffect(() => {
    if (!currentThreadId || unreadMessages.length === 0) return;
    unreadMessages.forEach((msg) => {
      const key = `${currentThreadId}:${msg.id}`;
      if (markQueueRef.current.has(key)) return;
      markQueueRef.current.add(key);
      markRead.mutate({ messageId: msg.id, threadId: currentThreadId });
    });
    clearThreadUnread(currentThreadId);
    qc.setQueryData(["threads", meId], (prev = []) =>
      prev.map((t) =>
        String(t.id) === String(currentThreadId)
          ? { ...t, unreadCount: 0 }
          : t
      )
    );
  }, [unreadMessages, currentThreadId, markRead, clearThreadUnread, qc, meId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  const send = useMutation({
    mutationFn: (payload) => Api.sendMessage(currentThreadId, payload),
    onSuccess: (raw) => {
      const created = normalizeMessage(raw?.message ?? raw);
      qc.setQueryData(["messages", currentThreadId], (prev) => {
        const bundle = prev || { messages: [] };
        const next = [...bundle.messages];
        let replaced = false;
        for (let i = next.length - 1; i >= 0; i--) {
          const idStr = String(next[i]?.id || "");
          if (idStr.startsWith("tmp-")) {
            next[i] = created;
            replaced = true;
            break;
          }
        }
        if (!replaced) next.push(created);
        return { ...bundle, messages: sortMessagesAsc(next) };
      });

      qc.setQueryData(["threads", meId], (prev = []) => {
        const arr = Array.isArray(prev) ? [...prev] : [];
        const idx = arr.findIndex(
          (t) => String(t.id) === String(currentThreadId)
        );
        const updatedAt = created.createdAt || new Date().toISOString();
        const base = {
          id: currentThreadId,
          peer: arr[idx]?.peer ?? created.sender,
          peerName:
            arr[idx]?.peerName ?? created.senderName ?? peerName ?? "محادثة",
          unreadCount: 0,
          lastMessage: created.text,
          updatedAt,
        };
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], ...base };
          const [item] = arr.splice(idx, 1);
          arr.unshift(item);
        } else {
          arr.unshift(base);
        }
        return arr;
      });

      clearThreadUnread(currentThreadId);
    },
    onError: () => {
      showErrorOnce("تعذر إرسال الرسالة", "send-fail");
      qc.setQueryData(["messages", currentThreadId], (prev) => {
        const bundle = prev || { messages: [] };
        const next = [...bundle.messages];
        for (let i = next.length - 1; i >= 0; i--) {
          if (String(next[i]?.id).startsWith("tmp-")) {
            next[i] = { ...next[i], failed: true };
            break;
          }
        }
        return { ...bundle, messages: next };
      });
    },
  });

  const retrySend = useCallback(
    (failedMsg) => {
      const content = (failedMsg?.text ?? failedMsg?.message ?? "").trim();
      if (!content) return;

      qc.setQueryData(["messages", currentThreadId], (prev) => {
        const bundle = prev || { messages: [] };
        const next = bundle.messages.map((msg) =>
          msg.id === failedMsg.id ? { ...msg, failed: false } : msg
        );
        return { ...bundle, messages: next };
      });

      send.mutate({ text: content, body: content, message: content });
    },
    [currentThreadId, qc, send]
  );

  const queueSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !currentThreadId) return;
    const now = new Date().toISOString();

    const optimistic = normalizeMessage({
      id: `tmp-${Date.now()}`,
      thread_id: currentThreadId,
      sender_id: meId,
      sender: { id: meId, name: myName },
      body: trimmed,
      created_at: now,
    });
    optimistic.fromMe = true;

    qc.setQueryData(["messages", currentThreadId], (prev) => {
      const bundle = prev || { messages: [] };
      return {
        ...bundle,
        messages: [...bundle.messages, optimistic],
      };
    });

    setText("");
    send.mutate({ text: trimmed, body: trimmed, message: trimmed });
  }, [text, currentThreadId, meId, myName, qc, send]);

  const subscriptionsRef = useRef(new Map());

  const showMessageToast = useCallback((message) => {
    toast(() => (
      <div className="text-right" dir="rtl">
        <div className="text-sm font-medium text-slate-800">
          وصلتك رسالة جديدة
        </div>
        <div className="text-xs text-slate-600">{message.senderName ?? "مستخدم"}</div>
        <div className="text-xs text-slate-500 mt-1 line-clamp-2">
          {message.text}
        </div>
      </div>
    ), {
      id: `msg-${message.id}`,
      duration: 5000,
    });
  }, []);

  const handleIncomingMessage = useCallback(
    (threadId, payload) => {
      try {
        const raw = payload?.message ?? payload;
        if (!raw) return;
        const message = normalizeMessage(raw);
        if (!message) return;
        const targetThreadId = message.threadId ?? threadId;
        if (!targetThreadId) return;
        const isActive =
          activeThreadRef.current != null &&
          String(activeThreadRef.current) === String(targetThreadId);

        qc.setQueryData(["messages", targetThreadId], (prev) => {
          const bundle = prev || { messages: [] };
          const merged = mergeUniqueMessages(bundle.messages, [message]);
          return { ...bundle, messages: merged };
        });

        qc.setQueryData(["threads", meId], (prev = []) => {
          const arr = Array.isArray(prev) ? [...prev] : [];
          const idx = arr.findIndex(
            (t) => String(t.id) === String(targetThreadId)
          );
          const updatedAt = message.createdAt || new Date().toISOString();
          const unreadIncrement = message.fromUserId !== meId && !isActive ? 1 : 0;
          if (idx >= 0) {
            const current = { ...arr[idx] };
            current.lastMessage = message.text;
            current.updatedAt = updatedAt;
            if (!current.peer && message.sender) current.peer = message.sender;
            current.peerName =
              current.peer?.name ?? current.peerName ?? message.senderName ?? "محادثة";
            if (unreadIncrement) {
              current.unreadCount = (current.unreadCount || 0) + unreadIncrement;
            }
            arr[idx] = current;
            const [item] = arr.splice(idx, 1);
            arr.unshift(item);
          } else {
            arr.unshift({
              id: targetThreadId,
              peer: message.sender,
              peerName: message.senderName ?? "محادثة",
              lastMessage: message.text,
              updatedAt,
              unreadCount: unreadIncrement,
            });
          }
          return arr;
        });

        if (message.fromUserId !== meId) {
          if (isActive) {
            clearThreadUnread(targetThreadId);
          } else {
            incrementUnread(targetThreadId);
            showMessageToast(message);
          }
        } else {
          clearThreadUnread(targetThreadId);
        }
      } catch (err) {
        console.error("Failed to process incoming chat message", err);
      }
    },
    [qc, meId, incrementUnread, clearThreadUnread, showMessageToast]
  );

  useEffect(() => {
    const echo = getEcho();
    if (!echo || !meId) return;

    const subs = subscriptionsRef.current;
    const ensureSubscription = (id) => {
      if (id == null) return;
      const key = String(id);
      if (subs.has(key)) return;
      const channel = echo.private(`threads.${id}`);
      const handler = (payload) => handleIncomingMessage(id, payload);
      channel.listen(".message.sent", handler);
      subs.set(key, { channel, handler });
    };

    threads.forEach((t) => ensureSubscription(t.id));
    ensureSubscription(currentThreadId);

    const activeKeys = new Set(threads.map((t) => String(t.id)));
    if (currentThreadId != null) activeKeys.add(String(currentThreadId));

    subs.forEach((value, key) => {
      if (!activeKeys.has(key)) {
        value.channel.stopListening(".message.sent", value.handler);
        if (typeof value.channel.unsubscribe === "function") {
          value.channel.unsubscribe();
        }
        subs.delete(key);
      }
    });

    return () => {
      subs.forEach((value) => {
        value.channel.stopListening(".message.sent", value.handler);
        if (typeof value.channel.unsubscribe === "function") {
          value.channel.unsubscribe();
        }
      });
      subs.clear();
    };
  }, [threads, currentThreadId, handleIncomingMessage, meId]);

  useEffect(() => {
    if (thread?.unreadCount && thread.unreadCount > 0) {
      setThreadUnread(thread.id, thread.unreadCount);
    }
  }, [thread, setThreadUnread]);

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4">
      <div className="grid gap-4 md:grid-cols-[260px_1fr]" dir="rtl">
        <aside
          className={`rounded-2xl border bg-white p-3 shadow-sm h-[70vh] overflow-auto ${
            showSidebar ? "block" : "hidden md:block"
          }`}
        >
          <div className="text-sm text-slate-600 mb-2">الدردشات</div>
          <div className="space-y-2">
            {threads.map((t) => {
              const name =
                t.peer?.fullName ?? t.peer?.full_name ?? t.peer?.name ?? t.peerName ?? "-";
              const unread = t.unreadCount ?? 0;
              return (
                <RouterLink
                  to={`/chat/${t.id}`}
                  key={t.id}
                  className={`block rounded-xl border p-2 hover:bg-slate-50 transition ${
                    normId(t.id) === currentThreadId
                      ? "border-brand-300 bg-brand-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900">
                      {name}
                    </div>
                    {unread > 0 && (
                      <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-danger-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-1 mt-1">
                    {t.lastMessage ?? ""}
                  </div>
                </RouterLink>
              );
            })}
            {threads.length === 0 && !threadsLoading && !threadsError && (
              <div className="text-xs text-slate-500">لا توجد محادثات بعد</div>
            )}
          </div>
        </aside>

        <section className="rounded-2xl border bg-white shadow-sm h-[70vh] flex flex-col">
          <header className="flex items-center justify-between border-b p-3">
            <div>
              <div className="text-sm text-slate-900 font-medium">{peerName}</div>
              <div className="text-xs text-slate-500">متصل الآن</div>
            </div>
            <button
              className="md:hidden px-3 py-1.5 rounded-xl border text-sm"
              onClick={() => setShowSidebar((v) => !v)}
            >
              {showSidebar ? "إخفاء القائمة" : "إظهار القائمة"}
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-slate-50/40 max-h-[calc(100vh-220px)]"
          >
            {messagesQuery.isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-2/3 rounded-xl bg-white border border-slate-200 animate-pulse"
                />
              ))}

            {!messagesQuery.isLoading &&
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  m={m}
                  meId={meId}
                  peerName={peerName}
                  onRetry={retrySend}
                />
              ))}

            {!messagesQuery.isLoading && messagesQuery.isFetching && (
              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                <span>يكتب…</span>
              </div>
            )}

            {!messagesQuery.isLoading &&
              messages.some((m) => m.failed) && (
                <div className="text-xs text-red-600">
                  فشل إرسال رسالة. حاول مجدداً.
                </div>
              )}
          </div>

          <footer className="p-3 border-t">
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    queueSend();
                  }
                }}
                rows={1}
                placeholder="اكتب رسالة…"
                className="flex-1 resize-none rounded-2xl border border-slate-300 p-2 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
              />
              <button
                onClick={queueSend}
                disabled={!currentThreadId}
                className="px-4 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
              >
                إرسال
              </button>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Enter للإرسال — Shift+Enter لسطر جديد
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

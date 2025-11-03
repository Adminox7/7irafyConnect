import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { showErrorOnce } from "../api/http";
import { useAuthStore } from "../stores/auth";
import toast from "react-hot-toast";
import { useNotificationStore } from "../stores/notifications";
import { getEcho } from "../lib/echo";

function normId(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function getMeId() {
  const u = useAuthStore.getState()?.user;
  return u?.id ?? undefined;
}

function toArray(maybeArray, key) {
  if (Array.isArray(maybeArray)) return maybeArray;
  if (maybeArray && key && Array.isArray(maybeArray[key])) return maybeArray[key];
  if (Array.isArray(maybeArray?.threads)) return maybeArray.threads;
  return [];
}

function normalizeMsg(m) {
  // وحّد الحقول لواجهة العرض
  const body = m?.text ?? m?.message ?? m?.body ?? "";
  const created =
    m?.createdAt ?? m?.created_at ?? m?.created ?? m?.date ?? null;
  const sender = m?.sender ?? m?.from_user ?? null;

  return {
    ...m,
    text: body,
    createdAt: created || m?.createdAt,
    fromUserId:
      m?.fromUserId ?? m?.from_user_id ?? m?.senderId ?? m?.sender_id ?? null,
    senderName: sender?.name ?? m?.senderName ?? m?.sender_name ?? null,
    readAt: m?.readAt ?? m?.read_at ?? null,
    sender,
  };
}

function MessageBubble({ m, meId, onRetry }) {
  const fromMe = (meId != null && m.fromUserId === meId) || m.fromMe;
  const failed = Boolean(m.failed);
  const senderName = m.senderName ?? m.sender?.name ?? null;

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
          {!fromMe && senderName && (
            <div className="mb-1 text-xs font-medium text-brand-700">{senderName}</div>
          )}
        <div className="whitespace-pre-wrap text-slate-800">{m.text || ""}</div>
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

  const meId = getMeId() ?? 0;
  const setThreadUnread = useNotificationStore((s) => s.setThreadUnread);
  const clearThread = useNotificationStore((s) => s.clearThread);

  // ─────────────── THREADS ───────────────
  const {
    data: threads = [],
    isLoading: threadsLoading,
    isError: threadsError,
  } = useQuery({
    queryKey: ["threads", meId],
    queryFn: () => Api.getChatThreads(),
    enabled: !!meId,
    refetchOnWindowFocus: false,
    select: (res) =>
      toArray(res, "threads").map((t) => ({
        ...t,
        unreadCount: t?.unread_count ?? t?.unreadCount ?? 0,
        lastMessage: t?.last_message ?? t?.lastMessage ?? "",
        updatedAt: t?.last_message_at ?? t?.updated_at ?? t?.updatedAt ?? null,
      })),
  });

  // حدّد الثريد الحالي
  const firstId = threads[0]?.id;
  const currentThreadId = normId(threadId ?? firstId);

  useEffect(() => {
    toArray(threads).forEach((t) => {
      if (t?.id != null) {
        setThreadUnread(t.id, t.unreadCount ?? t.unread_count ?? 0);
      }
    });
  }, [threads, setThreadUnread]);

  // ─────────────── MESSAGES ───────────────
  const {
    data: messagePayload,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["messages", currentThreadId],
    queryFn: () => Api.getThreadMessages(currentThreadId),
    enabled: !!currentThreadId,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    select: (res) => ({
      messages: toArray(res, "messages").map(normalizeMsg),
      thread: res?.thread ?? null,
    }),
  });

  const messages = messagePayload?.messages ?? [];
  const threadFromApi = messagePayload?.thread;

  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!currentThreadId || !messages.length) {
      return;
    }

    const unreadMessages = messages.filter(
      (msg) => !msg.readAt && msg.fromUserId !== meId && Number.isFinite(Number(msg.id))
    );

    if (unreadMessages.length === 0) {
      clearThread(currentThreadId);
      setThreadUnread(currentThreadId, 0);
      return;
    }

    const ids = unreadMessages.map((msg) => Number(msg.id)).filter((id) => Number.isFinite(id));

    qc.setQueryData(["messages", currentThreadId], (prev) => {
      const base = prev && typeof prev === "object" && Array.isArray(prev.messages)
        ? { ...prev }
        : { messages: [] };
      const list = Array.isArray(base.messages) ? [...base.messages] : [];
      const setIds = new Set(ids);
      const next = list.map((item) =>
        setIds.has(Number(item.id)) ? { ...item, readAt: item.readAt || new Date().toISOString() } : item
      );
      return { ...base, messages: next };
    });

    clearThread(currentThreadId);
    setThreadUnread(currentThreadId, 0);

    qc.setQueryData(["threads", meId], (prev = []) =>
      toArray(prev).map((t) =>
        normId(t.id) === currentThreadId
          ? { ...t, unreadCount: 0 }
          : t
      )
    );

    ids.forEach((id) => {
      Api.markMessageRead(id).catch(() => {});
    });
  }, [messages, currentThreadId, meId, qc, clearThread, setThreadUnread]);

  // ─────────────── SEND ───────────────
  const send = useMutation({
    mutationFn: (payload) => Api.sendMessage(currentThreadId, payload),
    onSuccess: (createdRaw) => {
      const created = normalizeMsg(createdRaw?.message ?? createdRaw);

      // بدل tmp ب created
      qc.setQueryData(["messages", currentThreadId], (prev) => {
        const base = prev && typeof prev === "object" && Array.isArray(prev.messages)
          ? { ...prev }
          : { messages: [] };
        const copy = Array.isArray(base.messages) ? [...base.messages] : [];
        let replaced = false;
        for (let i = copy.length - 1; i >= 0; i--) {
          const idStr = String(copy[i]?.id || "");
          if (idStr.startsWith("tmp-")) {
            copy[i] = created;
            replaced = true;
            break;
          }
        }
        const nextMessages = replaced ? copy : [...copy, created];
        return { ...base, messages: nextMessages };
      });

      // حدّث آخر رسالة في الثريد
      qc.setQueryData(["threads", meId], (prev = []) =>
        toArray(prev).map((t) =>
          normId(t.id) === currentThreadId
            ? {
                ...t,
                lastMessage: created.text || "",
                updatedAt:
                  created.createdAt || new Date().toISOString(),
                unreadCount: 0,
              }
            : t
        )
      );
    },
    onError: () => {
      showErrorOnce("تعذر إرسال الرسالة", "send-fail");
      qc.setQueryData(["messages", currentThreadId], (prev) => {
        const base = prev && typeof prev === "object" && Array.isArray(prev.messages)
          ? { ...prev }
          : { messages: [] };
        const copy = Array.isArray(base.messages) ? [...base.messages] : [];
        for (let i = copy.length - 1; i >= 0; i--) {
          const it = copy[i];
          if (it && String(it.id).startsWith("tmp-")) {
            copy[i] = { ...it, failed: true };
            break;
          }
        }
        return { ...base, messages: copy };
      });
    },
  });

  useEffect(() => {
    if (!currentThreadId) return undefined;
    const echo = getEcho();
    if (!echo) return undefined;

    const channel = echo.private(`threads.${currentThreadId}`);

    channel.listen(".message.sent", (event) => {
      const payload = normalizeMsg(event?.message ?? event);

      qc.setQueryData(["messages", currentThreadId], (prev) => {
        const base = prev && typeof prev === "object" && Array.isArray(prev.messages)
          ? { ...prev }
          : { messages: [] };
        const list = Array.isArray(base.messages) ? [...base.messages] : [];
        const exists = list.some((msg) => String(msg.id) === String(payload.id));
        const next = exists ? list : [...list, payload];
        return { ...base, messages: next };
      });

      qc.setQueryData(["threads", meId], (prev = []) =>
        toArray(prev).map((t) =>
          normId(t.id) === normId(payload.thread_id ?? currentThreadId)
            ? {
                ...t,
                lastMessage: payload.text || payload.body || "",
                updatedAt: payload.createdAt || new Date().toISOString(),
              }
            : t
        )
      );

      const fromMe = payload.fromUserId === meId;
      if (!fromMe) {
        toast.success("وصلتك رسالة جديدة");
      }
    });

    return () => {
      channel.stopListening(".message.sent");
      channel.unsubscribe();
    };
  }, [currentThreadId, qc, meId]);

  // Scroll لآخر الرسائل
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages?.length]);

  // ✅ استعمل Array.isArray هنا لتفادي الخطأ
  const threadFromList = useMemo(() => {
    if (!currentThreadId) return undefined;
    const arr = Array.isArray(threads) ? threads : [];
    return arr.find((t) => normId(t.id) === currentThreadId);
  }, [threads, currentThreadId]);

  const thread = threadFromList || threadFromApi;

  const retrySend = (failedMsg) => {
    const content = failedMsg?.text ?? failedMsg?.message ?? "";
    if (!content) return;

    qc.setQueryData(["messages", currentThreadId], (prev = []) => {
      const base = prev && typeof prev === "object" && Array.isArray(prev.messages)
        ? { ...prev }
        : { messages: [] };
      const copy = Array.isArray(base.messages) ? [...base.messages] : [];
      const idx = copy.findIndex((x) => x.id === failedMsg.id);
      if (idx !== -1) copy[idx] = { ...copy[idx], failed: false };
      return { ...base, messages: copy };
    });

    // backend كيتسنى { body: string }
    send.mutate({ body: content });
  };

  const peerName =
    thread?.peer?.fullName ??
    thread?.peer?.full_name ??
    thread?.peer?.name ??
    "محادثة";

  const [showSidebar, setShowSidebar] = useState(false);

  const queueSend = () => {
    if (!text.trim() || !currentThreadId) return;
    const now = new Date().toISOString();

    // optimistic
    const optimistic = normalizeMsg({
      id: `tmp-${Date.now()}`,
      threadId: currentThreadId,
      fromUserId: meId || undefined,
      body: text,
      createdAt: now,
      read: false,
    });

    qc.setQueryData(["messages", currentThreadId], (prev) => {
      const base = prev && typeof prev === "object" && Array.isArray(prev.messages)
        ? { ...prev }
        : { messages: [] };
      const list = Array.isArray(base.messages) ? [...base.messages] : [];
      return { ...base, messages: [...list, optimistic] };
    });

    setText("");
    // backend → { body }
    send.mutate({ body: text });
  };

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4">
      <div className="grid gap-4 md:grid-cols-[260px_1fr]" dir="rtl">
        {/* Sidebar */}
        <aside className={`rounded-2xl border bg-white p-3 shadow-sm h-[70vh] overflow-auto ${showSidebar ? "block" : "hidden md:block"}`}>
          <div className="text-sm text-slate-600 mb-2">الدردشات</div>
          <div className="space-y-2">
            {toArray(threads).map((t) => {
              const name =
                t.peer?.fullName ?? t.peer?.full_name ?? t.peer?.name ?? "-";
              return (
                <RouterLink
                  to={`/chat/${t.id}`}
                  key={t.id}
                  className={`block rounded-xl border p-2 hover:bg-slate-50 ${
                    normId(t.id) === currentThreadId
                      ? "border-brand-300 bg-brand-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900">{name}</div>
                  <div className="text-xs text-slate-600 line-clamp-1">
                    {t.lastMessage ?? ""}
                  </div>
                    {Number(t.unreadCount) > 0 && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-600">
                        <span className="inline-flex h-4 min-w-[1.25rem] items-center justify-center rounded-full bg-red-100 px-2 text-red-700">
                          {t.unreadCount}
                        </span>
                        <span>غير مقروءة</span>
                      </div>
                    )}
                </RouterLink>
              );
            })}
            {toArray(threads).length === 0 && !threadsLoading && !threadsError && (
              <div className="text-xs text-slate-500">لا توجد محادثات بعد</div>
            )}
          </div>
        </aside>

        {/* Conversation */}
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
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-2/3 rounded-xl bg-white border border-slate-200 animate-pulse"
                />
              ))}

              {!isLoading &&
                (Array.isArray(messages) ? messages : []).map((m) => (
                  <MessageBubble key={m.id} m={m} meId={meId} onRetry={retrySend} />
                ))}

            {!isLoading && isFetching && (
              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                <span>يكتب…</span>
              </div>
            )}

              {!isLoading &&
                (Array.isArray(messages) ? messages : []).some((m) => m.failed) && (
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
                className="flex-1 resize-none rounded-2xl border border-slate-300 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
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

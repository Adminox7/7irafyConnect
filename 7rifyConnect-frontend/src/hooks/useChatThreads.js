import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import { useNoticeStore } from "../stores/notifications";

const toArray = (payload, key) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizePeer = (rawPeer = {}) => {
  const name =
    rawPeer.fullName ??
    rawPeer.full_name ??
    rawPeer.name ??
    rawPeer.displayName ??
    rawPeer.username ??
    "محادثة";
  return {
    ...rawPeer,
    name,
  };
};

export const normalizeThread = (thread) => {
  if (!thread) return thread;
  const id = thread.id ?? thread.thread_id ?? thread.threadId ?? thread.uuid;
  const peerRaw =
    thread.peer ??
    thread.otherParticipant ??
    thread.participant ??
    thread.user ??
    thread.recipient ??
    {};
  const peer = normalizePeer(peerRaw);

  const last =
    thread.lastMessage ??
    thread.last_message ??
    thread.message ??
    thread.last ??
    {};

  const lastBody =
    last.body ??
    last.text ??
    last.message ??
    thread.last_body ??
    thread.lastMessageBody ??
    "";

  const updatedAt =
    thread.updatedAt ??
    thread.updated_at ??
    last.created_at ??
    last.createdAt ??
    thread.created_at ??
    null;

  const unread =
    thread.unreadCount ??
    thread.unread_count ??
    thread.unread ??
    thread.unreadMessages ??
    0;

  return {
    ...thread,
    id,
    peer,
    peerName: peer.name,
    lastMessage: lastBody,
    updatedAt,
    unreadCount: Number.isFinite(+unread) ? Number(unread) : 0,
  };
};

const sortThreads = (threads) => {
  const normalized = Array.isArray(threads) ? threads.map(normalizeThread) : [];
  return normalized.sort((a, b) => {
    const timeA = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });
};

const mapsEqual = (a, b) => {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
};

export function useChatThreads(meId, options = {}) {
  const setThreadMap = useNoticeStore((s) => s.setThreadUnreadMap);

  const query = useQuery({
    queryKey: ["threads", meId],
    queryFn: () => Api.getChatThreads(),
    enabled: Boolean(meId),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    select: (payload) => sortThreads(toArray(payload, "threads")),
    ...options,
  });

  useEffect(() => {
    const rows = Array.isArray(query.data) ? query.data : [];
    const counts = {};
    rows.forEach((row) => {
      const count = Number(row?.unreadCount ?? 0);
      if (Number.isFinite(count) && count > 0) {
        counts[String(row.id)] = count;
      }
    });

    const current = useNoticeStore.getState().threadUnread;
    if (!mapsEqual(counts, current)) {
      setThreadMap(counts);
    }
  }, [query.data, setThreadMap]);

  return query;
}


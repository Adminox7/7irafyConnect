import { create } from "zustand";

export const useNotificationStore = create((set, get) => ({
  unreadThreads: {},
  totalUnread: 0,
  adminPendingCount: 0,
  inbox: [],

  setThreadUnread(threadId, count) {
    const next = { ...get().unreadThreads, [threadId]: Math.max(0, count || 0) };
    set({
      unreadThreads: next,
      totalUnread: Object.values(next).reduce((sum, val) => sum + (val || 0), 0),
    });
  },

  incrementThread(threadId) {
    const current = get().unreadThreads[threadId] || 0;
    get().setThreadUnread(threadId, current + 1);
  },

  clearThread(threadId) {
    const next = { ...get().unreadThreads };
    delete next[threadId];
    set({
      unreadThreads: next,
      totalUnread: Object.values(next).reduce((sum, val) => sum + (val || 0), 0),
    });
  },

  setAdminPending(count) {
    set({ adminPendingCount: Math.max(0, count || 0) });
  },

  incrementAdminPending() {
    set({ adminPendingCount: get().adminPendingCount + 1 });
  },

  pushInbox(notification) {
    set({ inbox: [notification, ...get().inbox].slice(0, 50) });
  },

  reset() {
    set({ unreadThreads: {}, totalUnread: 0, adminPendingCount: 0, inbox: [] });
  },
}));

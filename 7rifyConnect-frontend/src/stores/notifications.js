import { create } from "zustand";
import { useAuthStore } from "./auth";

const clampCount = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.ceil(num);
};

const sumCounts = (map) =>
  Object.values(map || {}).reduce((total, val) => total + clampCount(val), 0);

export const useNoticeStore = create((set) => ({
  threadUnread: {},
  messageTotal: 0,
  pendingTechnicians: 0,

  setThreadUnreadMap: (counts) => {
    const next = {};
    if (counts && typeof counts === "object") {
      for (const [threadId, value] of Object.entries(counts)) {
        const count = clampCount(value);
        if (count > 0) next[String(threadId)] = count;
      }
    }
    set({
      threadUnread: next,
      messageTotal: sumCounts(next),
    });
  },

  setThreadUnread: (threadId, value) => {
    const key = String(threadId);
    set((state) => {
      const next = { ...state.threadUnread };
      const count = clampCount(value);
      if (count > 0) next[key] = count;
      else delete next[key];
      return {
        threadUnread: next,
        messageTotal: sumCounts(next),
      };
    });
  },

  incrementThreadUnread: (threadId, step = 1) => {
    const key = String(threadId);
    if (!key) return;
    set((state) => {
      const next = { ...state.threadUnread };
      const prev = clampCount(next[key] ?? 0);
      const inc = clampCount(step) || 1;
      next[key] = prev + inc;
      return {
        threadUnread: next,
        messageTotal: sumCounts(next),
      };
    });
  },

  clearThreadUnread: (threadId) => {
    const key = String(threadId);
    set((state) => {
      if (!key || !(key in state.threadUnread)) return state;
      const next = { ...state.threadUnread };
      delete next[key];
      return {
        threadUnread: next,
        messageTotal: sumCounts(next),
      };
    });
  },

  setPendingTechnicians: (count) =>
    set({ pendingTechnicians: clampCount(count) }),

  reset: () => set({ threadUnread: {}, messageTotal: 0, pendingTechnicians: 0 }),
}));

let subscribedToAuthReset = false;

export function initNoticeAuthSubscription() {
  if (subscribedToAuthReset) return;
  subscribedToAuthReset = true;
  useAuthStore.subscribe(
    (state) => state.token,
    (token) => {
      if (!token) {
        useNoticeStore.getState().reset();
      }
    }
  );
}

export const selectTotalAlerts = (state, includePending) =>
  state.messageTotal + (includePending ? state.pendingTechnicians : 0);


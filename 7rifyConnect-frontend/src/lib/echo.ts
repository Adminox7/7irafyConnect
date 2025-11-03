import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useAuthStore } from "../stores/auth";

declare global {
  interface Window {
    Pusher?: typeof Pusher;
  }
}

let echoInstance: Echo | null = null;
let currentToken: string | null = null;
let authSubscribed = false;

const env = import.meta.env;

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const isFalse = (value: unknown) =>
  value === "0" || value === "false" || value === false;

const buildConfig = (token: string) => {
  const authEndpoint =
    env.VITE_PUSHER_AUTH_ENDPOINT ||
    `${env.VITE_API_URL || "/api"}/broadcasting/auth`;

  const forceTLS = !isFalse(env.VITE_PUSHER_FORCE_TLS ?? env.VITE_PUSHER_TLS ?? true);
  const wsHost = env.VITE_PUSHER_HOST || env.VITE_PUSHER_WS_HOST || undefined;
  const wsPort = toNumber(env.VITE_PUSHER_PORT || env.VITE_PUSHER_WS_PORT);
  const wssPort = toNumber(env.VITE_PUSHER_WSS_PORT);

  const config: Record<string, unknown> = {
    broadcaster: "pusher",
    key: env.VITE_PUSHER_KEY,
    cluster: env.VITE_PUSHER_CLUSTER,
    forceTLS,
    authEndpoint,
    auth: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  };

  if (wsHost) config.wsHost = wsHost;
  if (wsPort) config.wsPort = wsPort;
  if (wssPort) config.wssPort = wssPort;

  const httpHost = env.VITE_PUSHER_HTTP_HOST;
  if (httpHost) config.httpHost = httpHost;

  const cluster = env.VITE_PUSHER_CLUSTER;
  if (!cluster) config.cluster = undefined;

  if (isFalse(env.VITE_PUSHER_ENCRYPTED)) config.encrypted = false;
  if (isFalse(env.VITE_PUSHER_TLS)) config.forceTLS = false;

  const enableStats = env.VITE_PUSHER_DISABLE_STATS;
  if (enableStats) config.disableStats = isFalse(enableStats) ? false : true;

  return config;
};

export function initializeEcho(): Echo | null {
  if (typeof window === "undefined") return null;
  const token = useAuthStore.getState()?.token;
  if (!token || !env.VITE_PUSHER_KEY) {
    disconnectEcho();
    return null;
  }

  if (!window.Pusher) {
    window.Pusher = Pusher;
  }

  if (echoInstance && currentToken === token) {
    return echoInstance;
  }

  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {}
  }

  echoInstance = new Echo(buildConfig(token));
  currentToken = token;
  return echoInstance;
}

export function getEcho(): Echo | null {
  return initializeEcho();
}

export function disconnectEcho() {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {}
  }
  echoInstance = null;
  currentToken = null;
}

export function ensureEchoAuthSync() {
  if (authSubscribed) return;
  authSubscribed = true;
  useAuthStore.subscribe(
    (state) => state.token,
    () => {
      const token = useAuthStore.getState().token;
      if (!token) {
        disconnectEcho();
      } else {
        initializeEcho();
      }
    }
  );
}


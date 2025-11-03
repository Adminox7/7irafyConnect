import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

let echoInstance: Echo | null = null;

const key = import.meta.env.VITE_PUSHER_KEY;
const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
const wsHost = import.meta.env.VITE_PUSHER_HOST || "127.0.0.1";
const wsPort = Number(import.meta.env.VITE_PUSHER_PORT || 6001);
const forceTLS = import.meta.env.VITE_PUSHER_TLS === "true";

function buildConfig(token?: string) {
  return {
    broadcaster: "pusher",
    key,
    cluster,
    forceTLS,
    wsHost,
    wsPort,
    wssPort: wsPort,
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${import.meta.env.VITE_API_URL || "/api"}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        Accept: "application/json",
      },
    },
  } satisfies Pusher.Config & Record<string, unknown>;
}

export function initEcho(token?: string): Echo | null {
  if (!key) {
    console.warn("Missing Pusher key – Echo disabled");
    return null;
  }

  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  echoInstance = new Echo(buildConfig(token));
  return echoInstance;
}

export function getEcho(): Echo | null {
  return echoInstance;
}

export function teardownEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}

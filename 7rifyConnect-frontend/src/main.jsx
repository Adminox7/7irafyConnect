// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import ErrorBoundary from "./util/ErrorBoundary";
import "./index.css";

const qc = new QueryClient();

async function bootstrap() {
  // شغّل MSW غير إلا قلتي ليه (افتراضياً مطفّي)
// src/main.jsx
if (import.meta.env.VITE_USE_MSW === "1") {
  const { worker } = await import("./mocks/browser");
  await worker.start({
    serviceWorker: { url: "/mockServiceWorker.js" },
    onUnhandledRequest: "bypass",
  });
}

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <QueryClientProvider client={qc}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

bootstrap();

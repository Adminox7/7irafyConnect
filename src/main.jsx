import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const qc = new QueryClient();

if (import.meta.env.DEV) {
  import("./mocks/browser")
    .then(({ worker }) =>
      worker.start({ serviceWorker: { url: "/mockServiceWorker.js" } })
    )
    .then(() => console.log("[MSW] Mocking enabled."))
    .catch((e) => console.warn("MSW failed:", e));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

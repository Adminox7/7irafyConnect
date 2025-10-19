import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import ErrorBoundary from "./util/ErrorBoundary";
import "./index.css";

const qc = new QueryClient();

if (import.meta.env.DEV) {
  import("./mocks/browser")
    .then(({ worker }) =>
      worker.start({ serviceWorker: { url: "/mockServiceWorker.js" } })
    );
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

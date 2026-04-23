import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "@/legacy/App";
import { registerServiceWorker } from "@/legacy/utils/registerSW";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ميزانيتي الذكية - Smart Monthly Budget" },
      {
        name: "description",
        content:
          "تطبيق الميزانية الشهرية الذكية: تتبع الدخل والمصروفات والادخار بسهولة.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
    registerServiceWorker();
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "#000000" }}
      />
    );
  }

  return <App />;
}
